import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ClientConfig = { url: string; key: string };

/** Values embedded at build time (local dev / CI with VITE_* set). */
function readViteEnv(): ClientConfig | null {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (url && key) return { url, key };
  return null;
}

let client: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Returns a Supabase browser client. Tries Vite env first, then fetches
 * `/api/client-config` (runtime) so Render works without bake-time VITE_*.
 */
export async function ensureSupabase(): Promise<SupabaseClient | null> {
  if (client) return client;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let cfg = readViteEnv();
    if (!cfg) {
      try {
        const res = await fetch("/api/client-config", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as {
            supabaseUrl?: string;
            supabaseAnonKey?: string;
          };
          const url = data.supabaseUrl?.trim() ?? "";
          const key = data.supabaseAnonKey?.trim() ?? "";
          if (url && key) cfg = { url, key };
          else if (!url || !key) {
            console.error(
              "[Supabase] /api/client-config يعيد حقولاً فارغة — أضف SUPABASE_URL و (SUPABASE_ANON_KEY أو SUPABASE_PUBLISHABLE_KEY) في بيئة Render ثم أعد النشر."
            );
          }
        } else {
          console.error("[Supabase] /api/client-config HTTP", res.status);
        }
      } catch (e) {
        console.error("[Supabase] client-config failed:", e);
      }
    }
    if (!cfg) {
      return null;
    }
    client = createClient(cfg.url, cfg.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return client;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}

/** True only when Vite already embedded keys (sync). */
export function isSupabaseConfiguredInBundle(): boolean {
  return readViteEnv() !== null;
}

export async function loginWithGithub() {
  const s = await ensureSupabase();
  if (!s) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    throw new Error(
      `Supabase غير مُعرّف: في Render أضف SUPABASE_URL و المفتاح العام (anon — ليس service role): SUPABASE_ANON_KEY أو SUPABASE_PUBLISHABLE_KEY. تحقّق أن ${origin}/api/client-config يعرض supabaseUrl و supabaseAnonKey غير فارغين، ثم أعد النشر.`
    );
  }

  const redirectTo = `${window.location.origin}/`;
  const { error } = await s.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }
}

export async function signOutSupabase() {
  const s = await ensureSupabase();
  if (s) {
    await s.auth.signOut();
  }
}
