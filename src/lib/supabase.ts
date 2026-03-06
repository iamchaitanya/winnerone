import { createClient } from '@supabase/supabase-js';

// Environment variables are now strictly typed via vite-env.d.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Global Error Interceptor for Supabase Actions
 * Monitors for PostgreSQL Error 53100 (Disk Quota Exceeded).
 * When caught, it throws the trigger to the central Game Store to present the UI Warning.
 */
export const handleSupabaseError = (error: any) => {
  if (error && error.code === '53100') {
    import('../store/useGameStore').then(({ useGameStore }) => {
      useGameStore.getState().setStorageFull(true);
    });
  }
  return error;
};