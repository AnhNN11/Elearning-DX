import { requireApiSupabase, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const supabase = await requireApiSupabase();
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const { data, error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/profile`,
      },
    });

    if (error || !data.url) {
      throw error ?? new Error("Không tạo được liên kết Google.");
    }

    return apiOk({ url: data.url });
  } catch (error) {
    return apiError(error);
  }
}
