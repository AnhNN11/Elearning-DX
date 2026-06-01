import { requireApiAdmin, requireApiSupabase } from "@/lib/api/auth";
import { isUploadFile, uploadCourseStorageFile } from "@/lib/api/course-storage";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { courseAssetSchema } from "@/lib/api/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params;
    const profile = await requireApiAdmin();
    const supabase = await requireApiSupabase();
    const formData = await request.formData();
    const parsed = courseAssetSchema.parse({
      courseId,
      courseSlug: formText(formData, "courseSlug"),
      title: formText(formData, "title"),
      kind: formText(formData, "kind"),
    });
    const file = formData.get("file");

    if (!isUploadFile(file)) {
      throw new Error("Vui lòng chọn tài liệu khóa học.");
    }

    const publicUrl = await uploadCourseStorageFile(supabase, {
      bucket: "course-documents",
      courseId: parsed.courseId,
      courseSlug: parsed.courseSlug,
      file,
      kind: parsed.kind,
      title: parsed.title,
      userId: profile.id,
    });

    return apiOk({ publicUrl });
  } catch (error) {
    return apiError(error);
  }
}
