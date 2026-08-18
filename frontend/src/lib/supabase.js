import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hjvydqsbvdytiaeeapzl.supabase.co';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdnlkcXNidmR5dGlhZWVhcHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTY5NTQsImV4cCI6MjEwMjUzMjk1NH0.-qetI1Kv5Rk3a4rR-pnEPrAprWevXB7SusKMF_5GmeU';

export const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');
export const supabaseAnonKey = rawKey.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

// Standard Supabase client initialization
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      }
    })
  : null;

// Helper to ensure VITE_BACKEND_URL never accidentally points to Supabase PostgREST
export const getBackendUrl = () => {
  const envUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
  if (envUrl && !envUrl.includes('supabase.co') && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://localhost:8000'; // Local development default
};
