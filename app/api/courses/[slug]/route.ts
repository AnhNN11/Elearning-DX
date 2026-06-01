import { ApiError } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getCourse } from "@/lib/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const course = await getCourse(slug);

    if (!course) {
      throw new ApiError("Không tìm thấy khóa học.", 404);
    }

    return apiOk({ course });
  } catch (error) {
    return apiError(error);
  }
}
