import { ApiError, requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { reconcileCoursePayment } from "@/lib/payment-reconciliation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const body = (await request.json().catch(() => ({}))) as { orderId?: unknown };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";

    if (!orderId) {
      throw new ApiError("Thiếu mã đơn hàng.", 400);
    }

    let payment = await orm.payments.findByOrderIdForUser(orderId, profile.id);
    if (!payment) {
      throw new ApiError("Không tìm thấy đơn hàng.", 404);
    }

    const result = await reconcileCoursePayment(payment);
    payment = result.payment;

    return apiOk({
      checked: result.checked,
      courseSlug: payment.courseSlug ?? "",
      matched: result.matched,
      orderId: payment.orderId,
      paid: payment.status === "paid",
      reconciliationError: result.error ?? "",
      status: payment.status,
    });
  } catch (error) {
    return apiError(error);
  }
}
