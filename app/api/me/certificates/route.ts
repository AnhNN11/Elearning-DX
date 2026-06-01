import { requireApiSupabase, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getUserCertificates } from "@/lib/data";

export async function GET() {
  try {
    await requireApiSupabase();
    const profile = await requireApiUser();
    const certificates = await getUserCertificates(profile.id);
    return apiOk({ certificates });
  } catch (error) {
    return apiError(error);
  }
}
