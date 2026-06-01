import { ApiError } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getCertificate } from "@/lib/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const certificate = await getCertificate(id);

    if (!certificate) {
      throw new ApiError("Không tìm thấy chứng chỉ.", 404);
    }

    return apiOk({ certificate });
  } catch (error) {
    return apiError(error);
  }
}
