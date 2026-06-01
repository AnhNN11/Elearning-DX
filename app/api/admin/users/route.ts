import { getAdminUsers } from "@/lib/data";
import { requireApiAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export async function GET() {
  try {
    await requireApiAdmin();
    const users = await getAdminUsers();
    return apiOk({ users });
  } catch (error) {
    return apiError(error);
  }
}
