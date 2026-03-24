'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
  product_name: string
  quantity: number
  product_price: number
  image_url: string | null
}

interface Order {
  id: string
  status: string
  payment_method: string
  delivery_method: string
  full_name: string
  subtotal: number
  created_at: string
  order_items: OrderItem[]
}

const statusStyles: Record<string, { bg: string; text: string; icon: string }> = {
  pending:   { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: '⏳' },
  delivered: { bg: 'bg-green-100',  text: 'text-green-700',  icon: '✅' },
}

const paymentLabels: Record<string, string> = {
  cod:   'Cash on Delivery',
  gcash: 'GCash',
  bank:  'Bank Transfer',
}

const deliveryLabels: Record<string, string> = {
  delivery: 'Home Delivery',
  pickup:   'Store Pickup',
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('orders')
        .select(`*, order_items (product_name, quantity, product_price, image_url)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders((data as unknown as Order[]) ?? [])
      setLoading(false)
    }
    fetchOrders()
  }, [router])

  const shortId = (id: string) => id.split('-')[0].toUpperCase()

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-stone-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>My Orders</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          {orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length > 1 ? 's' : ''} placed`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-stone-600 font-semibold text-lg">No orders yet</p>
          <p className="text-stone-400 text-sm mt-1 mb-6">Start shopping to see your orders here</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = statusStyles[order.status] ?? { bg: 'bg-stone-100', text: 'text-stone-600', icon: '📦' }
            const isExpanded = expandedId === order.id

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">

                {/* Order header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full text-left p-5 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">

                      {/* ID + status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-stone-500">#{shortId(order.id)}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${status.bg} ${status.text}`}>
                          {status.icon} {order.status}
                        </span>
                      </div>

                      {/* Product image strip */}
                      <div className="flex items-center gap-1.5">
                        {order.order_items.slice(0, 4).map((item, i) => (
                          <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                            {item.image_url ? (
                              <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                            )}
                          </div>
                        ))}
                        {order.order_items.length > 4 && (
                          <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0">
                            +{order.order_items.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-stone-400">
                        {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''} ·{' '}
                        {paymentLabels[order.payment_method] ?? order.payment_method} ·{' '}
                        {deliveryLabels[order.delivery_method] ?? order.delivery_method}
                      </p>

                      {/* Date */}
                      <p className="text-xs text-stone-300">
                        {new Date(order.created_at).toLocaleDateString('en-PH', {
                          month: 'long', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <p className="font-bold text-amber-700 text-base">
                        ₱{order.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <svg xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-stone-100 px-5 py-4 space-y-3 bg-stone-50">
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Items Ordered</p>

                    {order.order_items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          {item.image_url ? (
                            <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-700 truncate">{item.product_name}</p>
                          <p className="text-xs text-stone-400">× {item.quantity} · ₱{item.product_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })} each</p>
                        </div>
                        <p className="text-sm font-semibold text-stone-800 shrink-0">
                          ₱{(item.product_price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}

                    <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-800">
                      <span>Total</span>
                      <span className="text-amber-700">₱{order.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Payment reminders */}
                    {order.status === 'pending' && order.payment_method === 'gcash' && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 mb-1">Action Required</p>
                        <p className="text-xs text-blue-700">Send payment to <span className="font-semibold">09XX XXX XXXX</span> and use <span className="font-mono font-bold">#{shortId(order.id)}</span> as reference.</p>
                      </div>
                    )}
                    {order.status === 'pending' && order.payment_method === 'bank' && (
                      <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                        <p className="text-xs font-bold text-green-800 mb-1">Action Required</p>
                        <p className="text-xs text-green-700">Transfer to <span className="font-semibold">BDO 1234 5678 9012</span> and use <span className="font-mono font-bold">#{shortId(order.id)}</span> as reference.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}