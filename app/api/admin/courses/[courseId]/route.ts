import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { courseSchema } from "@/lib/api/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params;
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = courseSchema.parse({
      title: formText(formData, "title"),
      slug: formText(formData, "slug"),
      category: formText(formData, "category"),
      level: formText(formData, "level"),
      description: formText(formData, "description"),
      thumbnailUrl: formData.has("thumbnailUrl") ? formText(formData, "thumbnailUrl") : undefined,
      durationHours: formText(formData, "durationHours"),
      outcomes: formText(formData, "outcomes"),
      accent: formText(formData, "accent") || "#075bbb",
    });

    await orm.courses.update(courseId, parsed);

    return apiOk({ courseId, courseSlug: parsed.slug });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = PATCH;
