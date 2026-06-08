import { requireApiSupabase, requireApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  return value;
}

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const supabase = await requireApiSupabase();
    const requestUrl = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin;
    const next = safeNextPath(requestUrl.searchParams.get("next"));
    const { data, error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
