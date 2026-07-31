import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'stockflow_supabase_url';
const STORAGE_KEY_KEY = 'stockflow_supabase_key';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const match = hash.match(/#config=([A-Za-z0-9+/=]+)/) || search.match(/[?&]config=([A-Za-z0-9+/=]+)/);
      if (match && match[1]) {
        const decoded = JSON.parse(atob(match[1]));
        if (decoded.u && decoded.k) {
          saveSupabaseCredentials(decoded.u, decoded.k);
          window.history.replaceState(null, '', window.location.pathname);
          return { url: decoded.u.trim(), key: decoded.k.trim() };
        }
      }
    } catch (e) {
      console.warn('Could not parse URL configuration parameter:', e);
    }
  }

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  return {
    url: localUrl || envUrl || '',
    key: localKey || envKey || '',
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    else localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
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
}
