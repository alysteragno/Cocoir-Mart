import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'

export async function GET() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('orders').select('*').order('placed_at', { ascending: false })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('orders').insert(body).select('*').single()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return Response.json(data)
}
