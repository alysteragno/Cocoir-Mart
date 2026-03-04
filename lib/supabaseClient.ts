import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client ──────────────────────────────────────────
// Uses @supabase/ssr which stores session in COOKIES
// so middleware can read it server-side
export function supabaseBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// ── Server client (new instance each call) ──────────────────
// Used in Server Components and API routes.
export function supabaseServer(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
}