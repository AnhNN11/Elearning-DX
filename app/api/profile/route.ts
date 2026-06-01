import { requireApiOrm, requireApiSupabase, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk, formText } from "@/lib/api/responses";
import { profileSchema } from "@/lib/api/schemas";

export async function PATCH(request: Request) {
  try {
    const supabase = await requireApiSupabase();
    const orm = await requireApiOrm();
    const profile = await requireApiUser();
    const formData = await request.formData();
    const parsed = profileSchema.parse({
      fullName: formText(formData, "fullName"),
      avatarUrl: formText(formData, "avatarUrl"),
    });
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    const email = user?.email ?? profile.email ?? null;
    await orm.users.updateProfile(profile.id, email, parsed);

    return apiOk({ profile: { id: profile.id, fullName: parsed.fullName, avatarUrl: parsed.avatarUrl } });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = PATCH;
