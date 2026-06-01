import { requireApiOrm, requireApiUser } from "@/lib/api/auth";
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

    await orm.learning.enroll(profile.id, parsed.courseId);

    return apiOk({ courseSlug: parsed.courseSlug });
  } catch (error) {
    return apiError(error);
  }
}
