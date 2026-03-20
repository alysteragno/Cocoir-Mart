'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
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
}

const categories = ['All', 'Gardening', 'Construction', 'Home & Living', 'Bulk Orders']

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = supabaseBrowser()
      const { data } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })
      setProducts(data ?? [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault() // prevent navigating to product page
    setAddingId(product.id)

    const supabase = supabaseBrowser()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    // Check if already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle()

    if (existing) {
      // Increment quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    } else {
      // Insert new cart item
      await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: product.id, quantity: 1 })
    }

    setAddingId(null)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || p.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 mb-2">Our Products</p>
        <h1 className="text-3xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
          Shop Coconut Coir Products
        </h1>
        <p className="text-stone-500 mt-2 text-sm">Sustainable, natural, and eco-friendly products from the Philippines</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-800
              placeholder:text-stone-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150
                ${category === c
                  ? 'bg-stone-800 text-amber-50'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300 hover:text-stone-800'
                }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-stone-100 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl mb-4">🌿</p>
          <p className="text-stone-500 font-medium">
            {search || category !== 'All' ? 'No products match your filters' : 'No products available yet'}
          </p>
          {(search || category !== 'All') && (
            <button onClick={() => { setSearch(''); setCategory('All') }}
              className="mt-4 text-sm text-amber-700 hover:underline font-medium">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                style={{ opacity: 0, animation: 'fadeIn 300ms ease forwards', animationDelay: `${i * 40}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-square bg-stone-100 overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                        ⭐ Featured
                      </span>
                    )}
                    {product.stock <= 10 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-sm">
                        Only {product.stock} left
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5">
                  {product.category && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">
                      {product.category}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2 group-hover:text-amber-800 transition-colors">
                    {product.name}
                  </p>
                  {product.description && (
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 mb-3">
                    <p className="text-base font-bold text-stone-800">
                      ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] font-semibold text-stone-400">
                      {product.stock} in stock
                    </span>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={e => handleAddToCart(e, product)}
                    disabled={addingId === product.id}
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200
                      ${addedId === product.id
                        ? 'bg-green-500 text-white'
                        : 'bg-stone-800 hover:bg-amber-700 text-amber-50 hover:-translate-y-0.5 hover:shadow-md'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {addingId === product.id ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Adding…
                      </span>
                    ) : addedId === product.id ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Added!
                      </span>
                    ) : 'Add to Cart'}
                  </button>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-stone-400 text-right">
            Showing {filtered.length} of {products.length} products
          </p>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}