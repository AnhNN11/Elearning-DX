import { requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export async function GET() {
  try {
    const profile = await requireApiUser();
    return apiOk({ profile });
  } catch (error) {
    return apiError(error);
  }
}
