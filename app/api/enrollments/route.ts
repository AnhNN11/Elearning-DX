import { ApiError, requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { enrollSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const formData = await request.formData();
    const parsed = enrollSchema.parse({
      courseId: formText(formData, "courseId"),
      courseSlug: formText(formData, "courseSlug"),
    });
    const course = await orm.courses.findById(parsed.courseId);

    if (!course || course.slug !== parsed.courseSlug) {
      throw new ApiError("Không tìm thấy khóa học.", 404);
    }

    if (course.priceVnd > 0) {
      throw new ApiError("Khóa học này cần thanh toán SePay trước khi đăng ký.", 402);
    }

    await orm.learning.enroll(profile.id, parsed.courseId);

    return apiOk({ courseSlug: parsed.courseSlug });
  } catch (error) {
    return apiError(error);
  }
}
