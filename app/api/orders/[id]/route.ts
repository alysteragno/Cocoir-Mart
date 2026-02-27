import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, slug))')
    .eq('id', params.id)
    .single()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 })
  return Response.json(data)
}
