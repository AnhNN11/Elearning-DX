import { ApiError, requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { reconcileCoursePayment } from "@/lib/payment-reconciliation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId")?.trim();
    const shouldCheckSepay = url.searchParams.get("checkSepay") === "1";

    if (!orderId) {
      throw new ApiError("Thiếu mã đơn hàng.", 400);
    }

    let payment = await orm.payments.findByOrderIdForUser(orderId, profile.id);
    if (!payment) {
      throw new ApiError("Không tìm thấy đơn hàng.", 404);
    }

    if (payment.status === "pending" && shouldCheckSepay) {
      payment = (await reconcileCoursePayment(payment)).payment;
    }

    return apiOk({
      courseSlug: payment.courseSlug ?? "",
      orderId: payment.orderId,
      paid: payment.status === "paid",
      status: payment.status,
    });
  } catch (error) {
    return apiError(error);
  }
}
