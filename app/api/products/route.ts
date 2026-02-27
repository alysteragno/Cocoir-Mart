import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'

export async function GET() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('products')
    .select('id,name,slug,description,price,stock,status,is_featured,is_new,is_trending,is_best_seller,product_images(url)')
    .order('created_at', { ascending: false })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('products').insert(body).select('*').single()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return Response.json(data)
}
