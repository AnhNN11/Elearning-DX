import { createClient } from "@supabase/supabase-js";
import { hasSupabaseAdminEnv, supabaseServiceRoleKey, supabaseUrl } from "./config";

export function createAdminClient() {
  if (!hasSupabaseAdminEnv) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
