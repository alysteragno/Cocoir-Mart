import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url)')
    .eq('id', params.id)
    .single()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', params.id)
    .select('*')
    .single()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return Response.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { error } = await supabase.from('products').delete().eq('id', params.id)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(null, { status: 204 })
}
