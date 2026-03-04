import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client (singleton) ──────────────────────────────
// Reuses the same instance across the app so sessions and
// realtime subscriptions are not reset on every render.
let browserClient: SupabaseClient | null = null

export function supabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

// ── Server client (new instance each call) ──────────────────
// Used in Server Components and API routes.
// persistSession: false because the server does not store cookies.
export function supabaseServer(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
}