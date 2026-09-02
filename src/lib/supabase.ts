import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── PRODUCTION CREDENTIALS ──────────────────────────────────────────────────
// These are baked into every Vercel build via .env — always available on every device
const PROD_URL = 'https://tjhsiloiiffkrzgfsskf.supabase.co';
const PROD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaHNpbG9paWZma3J6Z2Zzc2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODgxNTAsImV4cCI6MjEwMDY2NDE1MH0.WEt5Ky21SqWulWHM2HKbdYoWuNGcXDVfvwNI1DmqBFM';

export function getSupabaseCredentials() {
  // 1. Use env vars if available (Vercel production build)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) return { url: envUrl.trim(), key: envKey.trim() };
  // 2. Hard-coded production fallback — always works even without .env
  return { url: PROD_URL, key: PROD_KEY };
}

export function saveSupabaseCredentials(_url: string, _key: string) {
  // No-op: credentials are baked into the build, not stored in localStorage
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const { url, key } = getSupabaseCredentials();
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 20 } },
  });
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return true; // Always configured — credentials are hardcoded
}

export function resetSupabaseClient() {
  _client = null;
}
