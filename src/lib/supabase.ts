import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

let client: SupabaseClient<Database> | undefined;

/**
 * The shared Supabase client. It is created on first use, so a build without
 * the env vars still runs everything that doesn't need the backend. Only a
 * feature's api.ts calls this; components never reach Supabase directly.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not set up. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  client = createClient<Database>(url, key);
  return client;
}
