import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { lessonSchema } from "@/lib/api/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params;
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = lessonSchema.parse({
      courseId,
      moduleTitle: formText(formData, "moduleTitle"),
      title: formText(formData, "title"),
      slug: formText(formData, "slug"),
      content: formText(formData, "content"),
      videoUrl: formText(formData, "videoUrl"),
      estimatedMinutes: formText(formData, "estimatedMinutes") || "15",
    });

    const lesson = await orm.courses.createLesson(parsed);

    return apiOk({ lesson });
  } catch (error) {
    return apiError(error);
  }
}
