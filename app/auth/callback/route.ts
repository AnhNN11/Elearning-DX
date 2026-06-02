import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/learn";
  }

  return value;
}

function authErrorPath(next: string) {
  return next.startsWith("/admin") ? "/admin/login?error=oauth" : "/login?error=oauth";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}${authErrorPath(next)}`);
  }

  const supabase = await createClient();
  const { error } = supabase
    ? await supabase.auth.exchangeCodeForSession(code)
    : { error: new Error("Supabase is not configured.") };

  if (error) {
    return NextResponse.redirect(`${origin}${authErrorPath(next)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
