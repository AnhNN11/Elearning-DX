import { getAdminRoles } from "@/lib/data";
import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { roleSchema } from "@/lib/api/schemas";

export async function GET() {
  try {
    await requireApiAdmin();
    const roles = await getAdminRoles();
    return apiOk({ roles });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = roleSchema.parse({
      slug: formText(formData, "slug"),
      name: formText(formData, "name"),
      description: formText(formData, "description") || "",
    });

    const role = await orm.users.upsertRole(parsed);

    return apiOk({ role });
  } catch (error) {
    return apiError(error);
  }
}
