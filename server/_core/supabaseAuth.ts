import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

const isConfigured = Boolean(ENV.supabaseUrl && ENV.supabaseServiceRoleKey);

const supabaseAdmin = isConfigured
  ? createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export type SupabaseAuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  provider?: string | null;
};

export async function getSupabaseUserFromBearer(
  authHeader: string | undefined
): Promise<SupabaseAuthUser | null> {
  if (!supabaseAdmin || !authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    name: (data.user.user_metadata?.full_name as string | undefined) ?? null,
    provider: data.user.app_metadata?.provider
      ? String(data.user.app_metadata.provider)
      : null,
  };
}
