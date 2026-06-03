import { ApiError, requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { createOrm } from "@/lib/orm";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(
  _request: Request,
  context: {
    params: Promise<{ orderId: string }>;
  },
) {
  try {
    await requireApiAdmin();

    const { orderId } = await context.params;
    const adminClient = createAdminClient();
    if (!adminClient) {
      throw new ApiError("Thiếu SUPABASE_SERVICE_ROLE_KEY cho xác nhận thanh toán.", 503);
    }

    const orm = await createOrm(adminClient);
    if (!orm) {
      throw new ApiError("Supabase ORM chưa được cấu hình.", 503);
    }

    const payment = await orm.payments.findByOrderId(orderId);
    if (!payment) {
      throw new ApiError("Không tìm thấy đơn thanh toán.", 404);
    }

    const paidPayment =
      payment.status === "paid"
        ? payment
        : await orm.payments.markPaid(payment.orderId, {
            raw: {
              confirmedBy: "admin",
              confirmedAt: new Date().toISOString(),
              previousRaw: payment.providerRaw ?? null,
            },
            referenceNumber: payment.referenceNumber,
            transactionId: payment.providerTransactionId,
          });

    await orm.learning.enroll(paidPayment.userId, paidPayment.courseId);

    return apiOk({
      orderId: paidPayment.orderId,
      status: "paid",
    });
  } catch (error) {
    return apiError(error);
  }
}
