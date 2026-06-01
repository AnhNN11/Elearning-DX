import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { lessonUpdateSchema } from "@/lib/api/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await context.params;
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = lessonUpdateSchema.parse({
      courseId: formText(formData, "courseId"),
      courseSlug: formText(formData, "courseSlug"),
      lessonId,
      title: formText(formData, "title"),
      slug: formText(formData, "slug"),
      content: formText(formData, "content"),
      videoUrl: formText(formData, "videoUrl"),
      estimatedMinutes: formText(formData, "estimatedMinutes"),
    });

    await orm.courses.updateLesson(parsed.lessonId, parsed);

    return apiOk({
      courseId: parsed.courseId,
      courseSlug: parsed.courseSlug,
      lessonId: parsed.lessonId,
    });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = PATCH;
