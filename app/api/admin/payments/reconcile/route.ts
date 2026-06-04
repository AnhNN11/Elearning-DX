import { ApiError, requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { createOrm } from "@/lib/orm";
import { reconcileCoursePayments } from "@/lib/payment-reconciliation";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireApiAdmin();

    const adminClient = createAdminClient();
    if (!adminClient) {
      throw new ApiError("Thiếu SUPABASE_SERVICE_ROLE_KEY cho đối soát thanh toán.", 503);
    }

    const orm = await createOrm(adminClient);
    if (!orm) {
      throw new ApiError("Supabase ORM chưa được cấu hình.", 503);
    }

    const payments = await orm.payments.listAll();
    const beforeStatusById = new Map(payments.map((payment) => [payment.id, payment.status]));
    const reconcileLimit = 20;
    const reconciledPayments = await reconcileCoursePayments(payments, reconcileLimit);
    const updatedCount = reconciledPayments.filter(
      (payment) => beforeStatusById.get(payment.id) !== payment.status,
    ).length;

    return apiOk({
      checkedCount: Math.min(
        payments.filter((payment) => payment.status === "pending" && payment.provider === "sepay").length,
        reconcileLimit,
      ),
      updatedCount,
    });
  } catch (error) {
    return apiError(error);
  }
}
