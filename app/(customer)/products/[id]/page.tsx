'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string | null
  image_url: string | null
  is_featured: boolean
  created_at: string
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [related, setRelated] = useState<Product[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/products')
        return
      }

      setProduct(data)

      if (data.category) {
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .gt('stock', 0)
          .limit(4)
        setRelated(relatedData ?? [])
      }

      setLoading(false)
    }
    fetch()
  }, [params.id, router])

  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    const supabase = supabaseBrowser()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: existing } = await supabase
      .from('cart_items').select('id, quantity')
      .eq('user_id', user.id).eq('product_id', product.id).maybeSingle()

    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity })
    }

    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleAddRelated = async (e: React.MouseEvent, p: Product) => {
    e.preventDefault()
    setAddingId(p.id)
    const supabase = supabaseBrowser()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: existing } = await supabase
      .from('cart_items').select('id, quantity')
      .eq('user_id', user.id).eq('product_id', p.id).maybeSingle()

    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: p.id, quantity: 1 })
    }

    setAddingId(null)
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-stone-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-stone-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const outOfStock = product.stock === 0

  return (
    <div className="max-w-5xl mx-auto space-y-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-400">
        <Link href="/products" className="hover:text-amber-700 transition-colors">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <span className="hover:text-amber-700 cursor-pointer transition-colors">{product.category}</span>
            <span>/</span>
          </>
        )}
        <span className="text-stone-600 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

        {/* Image */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow">⭐ Featured</span>
              )}
              {outOfStock && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow">Out of Stock</span>
              )}
              {!outOfStock && product.stock <= 10 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow">Only {product.stock} left</span>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700">{product.category}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-stone-800">
            ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className={`text-sm font-medium ${outOfStock ? 'text-red-600' : 'text-green-700'}`}>
              {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
            </span>
          </div>

          {product.description && (
            <div className="border-t border-stone-100 pt-4">
              <p className="text-sm font-semibold text-stone-700 mb-2">Description</p>
              <p className="text-sm text-stone-500 leading-relaxed">{product.description}</p>
            </div>
          )}

          {!outOfStock && (
            <div className="border-t border-stone-100 pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-stone-700">Quantity</p>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-amber-50 transition-colors text-sm font-bold">−</button>
                  <span className="px-4 py-2 text-sm font-semibold text-stone-800 border-x border-stone-200 min-w-[40px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-amber-50 transition-colors text-sm font-bold">+</button>
                </div>
              </div>

              <button onClick={handleAddToCart} disabled={adding}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${added ? 'bg-green-500 text-white' : 'bg-stone-800 hover:bg-amber-700 text-amber-50 hover:-translate-y-0.5 hover:shadow-lg'}
                  disabled:opacity-60 disabled:cursor-not-allowed shadow-md`}>
                {adding ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Adding to Cart…
                  </span>
                ) : added ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </span>
                )}
              </button>

              {added && (
                <Link href="/cart" className="block text-center text-sm text-amber-700 hover:underline font-medium transition-all">
                  View Cart →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="border-t border-stone-100 pt-10">
          <h2 className="text-lg font-bold text-stone-800 mb-5" style={{ fontFamily: "'Georgia', serif" }}>
            More from {product.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <div key={p.id} className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <Link href={`/products/${p.id}`}>
                  <div className="relative aspect-square bg-stone-100 overflow-hidden">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                </Link>
                <div className="p-3 space-y-2">
                  <Link href={`/products/${p.id}`}>
                    <p className="text-xs font-semibold text-stone-700 line-clamp-2 hover:text-amber-800 transition-colors">{p.name}</p>
                    <p className="text-sm font-bold text-stone-800 mt-1">₱{p.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                  </Link>
                  <button
                    onClick={e => handleAddRelated(e, p)}
                    disabled={addingId === p.id}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                      ${addedId === p.id ? 'bg-green-500 text-white' : 'bg-stone-800 hover:bg-amber-700 text-amber-50'}
                      disabled:opacity-60`}>
                    {addingId === p.id ? 'Adding…' : addedId === p.id ? '✓ Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}