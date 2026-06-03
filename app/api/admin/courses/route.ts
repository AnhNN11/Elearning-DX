import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { isUploadFile, uploadCourseStorageFile } from "@/lib/api/course-storage";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { courseSchema } from "@/lib/api/schemas";
import { getCourses } from "@/lib/data";

export async function GET() {
  try {
    await requireApiAdmin();
    const courses = await getCourses(true);
    return apiOk({ courses });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const orm = await requireApiOrm();
    const profile = await requireApiAdmin();
    const formData = await request.formData();
    const parsed = courseSchema.parse({
      title: formText(formData, "title"),
      slug: formText(formData, "slug"),
      category: formText(formData, "category"),
      level: formText(formData, "level"),
      description: formText(formData, "description"),
      thumbnailUrl: formText(formData, "thumbnailUrl") || undefined,
      durationHours: formText(formData, "durationHours") || "1",
      priceVnd: formText(formData, "priceVnd") || "0",
      outcomes: formText(formData, "outcomes") || "Hoàn thành nội dung khóa học\nLàm bài kiểm tra\nNhận chứng chỉ",
      accent: formText(formData, "accent") || "#075bbb",
    });

    const course = await orm.courses.create(parsed, profile.id);

    const bannerFile = formData.get("banner");
    if (course && isUploadFile(bannerFile)) {
      await uploadCourseStorageFile(orm.supabase, {
        bucket: "course-media",
        courseId: course.id,
        courseSlug: course.slug,
        file: bannerFile,
        kind: "banner",
        title: `${course.title} banner`,
        userId: profile.id,
      });
    }

    return apiOk({ course });
  } catch (error) {
    return apiError(error);
  }
}
