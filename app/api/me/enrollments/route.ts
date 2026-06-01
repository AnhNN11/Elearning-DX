import { requireApiSupabase, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getUserEnrollments } from "@/lib/data";

export async function GET() {
  try {
    await requireApiSupabase();
    const profile = await requireApiUser();
    const enrollments = await getUserEnrollments(profile.id);
    return apiOk({ enrollments });
  } catch (error) {
    return apiError(error);
  }
}
