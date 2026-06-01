import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { hasSupabaseEnv } from "./supabase/config";
import type { AccountIdentity, Profile } from "./types";

export const demoProfile: Profile = {
  id: "demo-admin",
  fullName: "Nguyễn Nhật Anh",
  email: "admin@techlearn.local",
  role: "admin",
};

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv) {
    return demoProfile;
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

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    fullName: data?.full_name ?? user.email ?? "Learner",
    email: user.email,
    avatarUrl: data?.avatar_url ?? undefined,
    role: data?.role === "admin" ? "admin" : "student",
  };
}

export async function requireUser() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await requireUser();

  if (profile.role !== "admin") {
    redirect("/learn");
  }

  return profile;
}

export async function getAccountIdentities(): Promise<AccountIdentity[]> {
  if (!hasSupabaseEnv) {
    return [
      {
        id: "demo-email",
        provider: "email",
        email: demoProfile.email,
        createdAt: new Date(2026, 0, 12).toISOString(),
      },
    ];
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
