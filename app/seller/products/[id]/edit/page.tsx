// app/seller/products/[id]/edit/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import ProductForm from '@/components/crud/ProductForm'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [initialData, setInitialData] = useState<null | object>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/seller/products')
        return
      }

      setInitialData({
        name: data.name,
        description: data.description ?? '',
        price: String(data.price),
        stock: String(data.stock),
        category: data.category ?? '',
        is_featured: data.is_featured,
        image_url: data.image_url,
      })
      setFetching(false)
    }
    fetch()
  }, [params.id, router])

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-stone-400 text-sm">
        Loading product…
      </div>
    )
  }

  return <ProductForm productId={params.id} initialData={initialData ?? undefined} />
}