import { ApiError } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getLesson } from "@/lib/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; lessonSlug: string }> },
) {
  try {
    const { slug, lessonSlug } = await context.params;
    const { course, lesson } = await getLesson(slug, lessonSlug);

    if (!course || !lesson) {
      throw new ApiError("Không tìm thấy bài học.", 404);
    }

    return apiOk({ course, lesson });
  } catch (error) {
    return apiError(error);
  }
}
