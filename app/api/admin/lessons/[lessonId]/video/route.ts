import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { lessonVideoSchema } from "@/lib/api/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await context.params;
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = lessonVideoSchema.parse({
      courseId: formText(formData, "courseId"),
      courseSlug: formText(formData, "courseSlug"),
      lessonId,
      videoUrl: formText(formData, "videoUrl"),
    });

    await orm.courses.updateLessonVideo(parsed.lessonId, parsed.videoUrl);

    return apiOk({ courseId: parsed.courseId, courseSlug: parsed.courseSlug });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = PATCH;
