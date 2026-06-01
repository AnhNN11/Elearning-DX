import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/auth";
import { createOrm } from "@/lib/orm";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function requireApiSupabase(): Promise<SupabaseClient> {
  if (!hasSupabaseEnv) {
    throw new ApiError("Supabase chưa được cấu hình.", 503);
  }

  const supabase = await createClient();
  if (!supabase) {
    throw new ApiError("Không thể khởi tạo Supabase client.", 503);
  }

  return supabase;
}

export async function requireApiOrm() {
  const supabase = await requireApiSupabase();
  const orm = await createOrm(supabase);

  if (!orm) {
    throw new ApiError("Supabase ORM chưa được cấu hình.", 503);
  }

  return orm;
}

export async function requireApiUser(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new ApiError("Bạn cần đăng nhập.", 401);
  }

  return profile;
}

export async function requireApiAdmin(): Promise<Profile> {
  const profile = await requireApiUser();

  if (profile.role !== "admin" && !profile.roles.includes("admin")) {
    throw new ApiError("Bạn không có quyền admin.", 403);
  }

  return profile;
}
