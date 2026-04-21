import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Only create a real client when env vars exist.
 * `createClient("", "")` throws at import time in production → white screen.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export async function loginWithGithub() {
  if (!supabase) {
    throw new Error("Supabase auth is not configured");
  }

  const redirectTo = `${window.location.origin}/`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }
}

export async function signOutSupabase() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}
