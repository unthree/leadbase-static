// Single source of truth for whether Supabase is wired up.
// When these env vars are absent (the default in mock mode), the app runs
// entirely on the mock DataSource and auth falls back to a local demo login.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
