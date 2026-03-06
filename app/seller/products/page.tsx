'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'

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

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = ['Gardening', 'Construction', 'Home & Living', 'Bulk Orders']

  const fetchProducts = async () => {
    const supabase = supabaseBrowser()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string, imageUrl: string | null) => {
    setDeletingId(id)
    const supabase = supabaseBrowser()

    // Delete image from storage if exists
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('products').remove([fileName])
      }
    }

    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
    setConfirmId(null)
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter ? p.category === categoryFilter : true
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 mb-0.5">Seller Panel</p>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
            Products
          </h1>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700
            text-amber-50 text-sm font-semibold rounded-xl transition-all duration-200
            shadow-md hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
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

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-700
            focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-sm">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-stone-500 font-medium text-sm">
              {search || categoryFilter ? 'No products match your filters' : 'No products yet'}
            </p>
            {!search && !categoryFilter && (
              <Link href="/seller/products/new"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-amber-700 hover:underline font-medium">
                Add your first product →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400 hidden sm:table-cell">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400 hidden md:table-cell">Stock</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400 hidden lg:table-cell">Featured</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <tr
                    key={product.id}
                    className="border-b border-stone-100 last:border-0 hover:bg-amber-50/40 transition-colors"
                    style={{ opacity: 0, animation: 'fadeIn 300ms ease forwards', animationDelay: `${i * 40}ms` }}
                  >
                    {/* Product */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-stone-200 overflow-hidden bg-stone-100 shrink-0">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800 leading-snug">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-stone-400 mt-0.5 max-w-[200px] truncate">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                        {product.category ?? '—'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3 font-semibold text-stone-700">
                      ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${product.stock === 0
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : product.stock <= 10
                            ? 'bg-orange-50 text-orange-600 border border-orange-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="px-5 py-3 hidden lg:table-cell">
                      {product.is_featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">
                          ⭐ Featured
                        </span>
                      ) : (
                        <span className="text-stone-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/seller/products/${product.id}/edit`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600
                            border border-stone-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>

                        {confirmId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(product.id, product.image_url)}
                              disabled={deletingId === product.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                            >
                              {deletingId === product.id ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(product.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500
                              border border-red-200 hover:bg-red-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-400 text-right">
          Showing {filtered.length} of {products.length} products
        </p>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}