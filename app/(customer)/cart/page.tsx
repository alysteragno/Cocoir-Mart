'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    stock: number
    image_url: string | null
    category: string | null
  }
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchCart = async () => {
    const supabase = supabaseBrowser()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product:products (
          id, name, price, stock, image_url, category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    setItems((data as unknown as CartItem[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCart() }, [])

  const updateQuantity = async (itemId: string, newQty: number, stock: number) => {
    if (newQty < 1 || newQty > stock) return
    setUpdatingId(itemId)
    const supabase = supabaseBrowser()
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', itemId)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i))
    setUpdatingId(null)
  }

  const removeItem = async (itemId: string) => {
    setUpdatingId(itemId)
    const supabase = supabaseBrowser()
    await supabase.from('cart_items').delete().eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
    setUpdatingId(null)
  }

  const clearCart = async () => {
    const supabase = supabaseBrowser()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setItems([])
  }

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-stone-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
            Your Cart
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {totalItems === 0 ? 'No items' : `${totalItems} item${totalItems > 1 ? 's' : ''}`}
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="py-24 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-stone-600 font-semibold text-lg">Your cart is empty</p>
          <p className="text-stone-400 text-sm mt-1 mb-6">Add some products to get started</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id}
                className={`flex gap-4 bg-white rounded-2xl border border-stone-200 p-4 transition-opacity duration-200
                  ${updatingId === item.id ? 'opacity-50' : 'opacity-100'}`}>

                {/* Image */}
                <Link href={`/products/${item.product.id}`} className="shrink-0">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100">
                    {item.product.image_url ? (
                      <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {item.product.category && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-0.5">
                      {item.product.category}
                    </p>
                  )}
                  <Link href={`/products/${item.product.id}`}>
                    <p className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2 hover:text-amber-800 transition-colors">
                      {item.product.name}
                    </p>
                  </Link>
                  <p className="text-sm font-bold text-stone-800 mt-1">
                    ₱{item.product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Quantity + remove */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  {/* Subtotal */}
                  <p className="text-sm font-bold text-amber-700">
                    ₱{(item.product.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.product.stock)}
                        disabled={item.quantity <= 1 || updatingId === item.id}
                        className="px-2.5 py-1.5 text-stone-500 hover:bg-amber-50 transition-colors text-xs font-bold disabled:opacity-30">
                        −
                      </button>
                      <span className="px-2.5 py-1.5 text-xs font-semibold text-stone-800 border-x border-stone-200 min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.product.stock)}
                        disabled={item.quantity >= item.product.stock || updatingId === item.id}
                        className="px-2.5 py-1.5 text-stone-500 hover:bg-amber-50 transition-colors text-xs font-bold disabled:opacity-30">
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button onClick={() => removeItem(item.id)} disabled={updatingId === item.id}
                      className="p-1.5 text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 sticky top-24">
              <h2 className="font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Order Summary</h2>

              <div className="space-y-2 text-sm">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-stone-500">
                    <span className="truncate max-w-[140px]">{item.product.name} × {item.quantity}</span>
                    <span className="shrink-0 ml-2">₱{(item.product.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-800">
                <span>Total</span>
                <span className="text-amber-700">₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>

              <Link href="/checkout"
                className="block w-full py-3.5 bg-stone-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-md">
                Proceed to Checkout →
              </Link>

              <Link href="/products"
                className="block w-full py-2.5 border border-stone-200 hover:border-amber-300 text-stone-600 hover:text-stone-800 text-sm font-medium rounded-xl text-center transition-all duration-200">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}