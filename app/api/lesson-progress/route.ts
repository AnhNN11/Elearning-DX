import { ApiError, requireApiOrm, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { completeLessonSchema } from "@/lib/api/schemas";
import { getLesson } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const formData = await request.formData();
    const parsed = completeLessonSchema.parse({
      courseSlug: formText(formData, "courseSlug"),
      lessonSlug: formText(formData, "lessonSlug"),
    });
    const { course, lesson } = await getLesson(parsed.courseSlug, parsed.lessonSlug);

    if (!course || !lesson) {
      throw new ApiError("Không tìm thấy bài học.", 404);
    }

    const progressPercent = await orm.learning.completeLesson(profile.id, course, lesson.id);

    return apiOk({ progressPercent });
  } catch (error) {
    return apiError(error);
  }
}
