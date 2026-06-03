import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/auth";
import { createOrm } from "@/lib/orm";
import { verifySepayIpn } from "@/lib/sepay";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = verifySepayIpn(request.headers, body);

    const adminClient = createAdminClient();
    if (!adminClient) {
      throw new ApiError("Thiếu SUPABASE_SERVICE_ROLE_KEY cho IPN.", 503);
    }

    const orm = await createOrm(adminClient);
    if (!orm) {
      throw new ApiError("Supabase ORM chưa được cấu hình.", 503);
    }

    const payment = await orm.payments.findByOrderId(payload.orderId);
    if (!payment) {
      console.warn("[sepayIpn] ignored unknown orderId", payload.orderId);
      return NextResponse.json({ success: true });
    }

    if (payment.status === "paid") {
      await orm.learning.enroll(payment.userId, payment.courseId);
      return NextResponse.json({ success: true });
    }

    if (payload.status === "cancelled") {
      await orm.payments.markCancelled(payment.orderId, payload.raw);
      return NextResponse.json({ success: true });
    }

    if (payload.status !== "paid") {
      return NextResponse.json({ success: true });
    }

    if (payload.currency !== payment.currency || payload.amount < payment.amountVnd) {
      throw new ApiError("Số tiền SePay không khớp đơn hàng.", 400);
    }

    const paidPayment = await orm.payments.markPaid(payment.orderId, {
      raw: payload.raw,
      referenceNumber: payload.referenceNumber,
      transactionId: payload.transactionId,
    });
    await orm.learning.enroll(paidPayment.userId, paidPayment.courseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "IPN SePay lỗi.";
    const status = error instanceof ApiError ? error.status : 500;
    console.error("[sepayIpn]", message, error);

    return NextResponse.json({ error: message, success: false }, { status });
  }
}
