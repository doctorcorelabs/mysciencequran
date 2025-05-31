import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl) {
  console.error('Error: VITE_SUPABASE_URL is not set in .env file');
  throw new Error('Supabase URL is not configured. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_ANON_KEY is not set in .env file');
  throw new Error('Supabase anon key is not configured. Please check your .env file.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
