import { requireApiAdmin, requireApiSupabase } from "@/lib/api/auth";
import { isUploadFile, uploadCourseStorageFile } from "@/lib/api/course-storage";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { courseBannerSchema } from "@/lib/api/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params;
    const profile = await requireApiAdmin();
    const supabase = await requireApiSupabase();
    const formData = await request.formData();
    const parsed = courseBannerSchema.parse({
      courseId,
      courseSlug: formText(formData, "courseSlug"),
      title: formText(formData, "title"),
    });
    const file = formData.get("file");

    if (!isUploadFile(file)) {
      throw new Error("Vui lòng chọn ảnh banner khóa học.");
    }

    const publicUrl = await uploadCourseStorageFile(supabase, {
      bucket: "course-media",
      courseId: parsed.courseId,
      courseSlug: parsed.courseSlug,
      file,
      kind: "banner",
      title: parsed.title,
      userId: profile.id,
    });

    return apiOk({ publicUrl });
  } catch (error) {
    return apiError(error);
  }
}
