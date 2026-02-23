import { createClient } from '@supabase/supabase-js';

// Environment variables are now strictly typed via vite-env.d.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);