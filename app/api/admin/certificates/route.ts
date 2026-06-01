import { getCertificates } from "@/lib/data";
import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export async function GET() {
  try {
    await requireApiAdmin();
    const certificates = await getCertificates();
    return apiOk({ certificates });
  } catch (error) {
    return apiError(error);
  }
}
