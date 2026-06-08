import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cache } from "react";
import { createOrm } from "./orm";
import { createClient } from "./supabase/server";
import { hasSupabaseAuthCookie } from "./supabase/auth-cookies";
import { hasSupabaseEnv } from "./supabase/config";
import type { AccountIdentity, Profile } from "./types";

async function loadCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  const cookieStore = await cookies();
  if (!hasSupabaseAuthCookie(cookieStore.getAll())) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const orm = await createOrm(supabase);
  return orm ? orm.users.profileForAuthUser(user) : null;
}

export const getCurrentProfileForRequest = cache(loadCurrentProfile);

export async function getCurrentProfile(): Promise<Profile | null> {
  return getCurrentProfileForRequest();
}

export async function requireUser() {
  const profile = await getCurrentProfileForRequest();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await getCurrentProfileForRequest();

  if (!profile) {
    redirect("/admin/login");
  }

  if (profile.role !== "admin" && !profile.roles.includes("admin")) {
    redirect("/admin/login?error=not-admin");
  }

  return profile;
}

export async function getAccountIdentities(): Promise<AccountIdentity[]> {
  if (!hasSupabaseEnv) {
    return [];
  }

  const supabase = await createClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.auth.getUserIdentities();
  if (error || !data?.identities) {
    return [];
  }

  return data.identities.map((identity) => {
    const identityData = identity.identity_data as { email?: string } | null;

    return {
      id: identity.identity_id ?? identity.id,
      provider: identity.provider,
      email: identityData?.email,
      createdAt: identity.created_at,
      lastSignInAt: identity.last_sign_in_at ?? undefined,
    };
  });
}
