import { ApiError, requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId")?.trim();

    if (!orderId) {
      throw new ApiError("Thiếu mã đơn hàng.", 400);
    }

    const payment = await orm.payments.findByOrderIdForUser(orderId, profile.id);
    if (!payment) {
      throw new ApiError("Không tìm thấy đơn hàng.", 404);
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
