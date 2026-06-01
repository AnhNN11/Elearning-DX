import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { coursePublishSchema } from "@/lib/api/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params;
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = coursePublishSchema.parse({
      courseId,
      courseSlug: formText(formData, "courseSlug"),
      published: formData.get("published") === "on" || formData.get("published") === "true",
    });

    await orm.courses.setPublished(parsed.courseId, parsed.published);

    return apiOk({ courseId: parsed.courseId, courseSlug: parsed.courseSlug });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = PATCH;
