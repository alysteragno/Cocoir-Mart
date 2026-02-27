import { supabaseServer } from './supabaseClient'

export async function getProducts({ featured = false }: { featured?: boolean } = {}) {
  const supabase = supabaseServer()
  let query = supabase
    .from('products')
    .select('id,name,slug,price,product_images(url)')
    .order('created_at', { ascending: false })

  if (featured) query = query.eq('is_featured', true)

  const { data } = await query
  return data || []
}

export async function getProductBySlug(slug: string) {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(url)')
    .eq('slug', slug)
    .single()
  return data
}
