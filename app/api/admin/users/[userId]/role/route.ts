import { requireApiAdmin, requireApiOrm } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { userRoleSchema } from "@/lib/api/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const admin = await requireApiAdmin();
    const orm = await requireApiOrm();
    const formData = await request.formData();
    const parsed = userRoleSchema.parse({
      userId,
      role: formText(formData, "role"),
    });

    await orm.users.assignSingleRole(parsed.userId, parsed.role, admin.id);

    return apiOk({ role: parsed.role });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = PATCH;
