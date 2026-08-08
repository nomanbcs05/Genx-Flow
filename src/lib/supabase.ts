import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hard-coded env credentials — always take top priority
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getSupabaseCredentials() {
  // ENV variables always win — no localStorage override possible
  if (ENV_URL && ENV_KEY) {
    return { url: ENV_URL.trim(), key: ENV_KEY.trim() };
  }
  // Fallback: check localStorage only if env vars are missing
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('stockflow_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('stockflow_supabase_key') : null;
  return { url: localUrl || '', key: localKey || '' };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('stockflow_supabase_url', url.trim());
    else localStorage.removeItem('stockflow_supabase_url');
    if (key) localStorage.setItem('stockflow_supabase_key', key.trim());
    else localStorage.removeItem('stockflow_supabase_key');
  }
}

let supabaseInstance: SupabaseClient | null = null;
let instanceUrl = '';
let instanceKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  // Re-create client if credentials changed
  if (!supabaseInstance || instanceUrl !== url || instanceKey !== key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } },
      });
      instanceUrl = url;
      instanceKey = key;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key);
}

export function resetSupabaseClient() {
  supabaseInstance = null;
  instanceUrl = '';
  instanceKey = '';
}
