"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv, supabasePublishableKey, supabaseUrl } from "./config";

export function createClient() {
  if (!hasSupabaseEnv) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
