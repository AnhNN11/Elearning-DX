import { ApiError, requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { courseCheckoutSchema } from "@/lib/api/schemas";
import { createOrm } from "@/lib/orm";
import {
  createSepayOrderId,
  createSepayPaymentContent,
  createSepayQrImageUrl,
  getSepayExpiresAt,
  requireSepayConfig,
} from "@/lib/sepay";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const formData = await request.formData();
    const parsed = courseCheckoutSchema.parse({
      courseId: formText(formData, "courseId"),
      courseSlug: formText(formData, "courseSlug"),
    });
    const course = await orm.courses.findById(parsed.courseId);

    if (!course || course.slug !== parsed.courseSlug) {
      throw new ApiError("Không tìm thấy khóa học.", 404);
    }

    const enrollments = await orm.learning.listEnrollmentsByUser(profile.id);
    const alreadyEnrolled = enrollments.some((enrollment) => enrollment.courseId === course.id);

    if (alreadyEnrolled) {
      return apiOk({
        alreadyEnrolled: true,
        checkoutUrl: `/learn/${course.slug}`,
        courseSlug: course.slug,
      });
    }

    if (course.priceVnd <= 0) {
      await orm.learning.enroll(profile.id, course.id);

      return apiOk({
        checkoutUrl: `/learn/${course.slug}`,
        courseSlug: course.slug,
        free: true,
      });
    }

    const config = requireSepayConfig();
    const adminClient = createAdminClient();
    if (!adminClient) {
      throw new ApiError("Thiếu SUPABASE_SERVICE_ROLE_KEY cho thanh toán.", 503);
    }

    const adminOrm = await createOrm(adminClient);
    if (!adminOrm) {
      throw new ApiError("Supabase ORM chưa được cấu hình.", 503);
    }

    const orderId = createSepayOrderId();
    const paymentContent = createSepayPaymentContent(orderId);
    const qrImageUrl = createSepayQrImageUrl({
      amountVnd: course.priceVnd,
      paymentContent,
    });
    const payment = await adminOrm.payments.createCoursePayment({
      amountVnd: course.priceVnd,
      courseId: course.id,
      currency: course.currency,
      expiresAt: getSepayExpiresAt(config.expiresMinutes).toISOString(),
      orderId,
      paymentContent,
      provider: "sepay",
      userId: profile.id,
    });

    await adminOrm.payments.attachProviderPayment(orderId, {
      bankAccount: config.bankAccount,
      bankAccountName: config.bankAccountName,
      bankCode: config.bankCode,
      checkoutUrl: `/checkout/${payment.orderId}`,
      providerPaymentId: orderId,
      qrImageUrl,
      raw: {
        bankAccount: config.bankAccount,
        bankAccountName: config.bankAccountName,
        bankCode: config.bankCode,
        env: config.env,
        qrImageUrl,
      },
    });

    return apiOk({
      checkoutUrl: `/checkout/${payment.orderId}`,
      orderId: payment.orderId,
    });
  } catch (error) {
    return apiError(error);
  }
}
