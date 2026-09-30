import { createClient } from '@supabase/supabase-js'

// Pastikan variabel di .env menggunakan awalan VITE_ 
// Contoh: VITE_SUPABASE_URL=https://xyzcompany.supabase.co
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)