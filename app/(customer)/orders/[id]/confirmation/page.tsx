'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  payment_method: string
  delivery_method: string
  full_name: string
  phone: string
  address: string | null
  subtotal: number
  created_at: string
  order_items: {
    id: string
    product_name: string
    product_price: number
    quantity: number
  }[]
}

const paymentLabels: Record<string, string> = {
  cod: 'Cash on Delivery',
  gcash: 'GCash',
  bank: 'Bank Transfer',
}

const deliveryLabels: Record<string, string> = {
  delivery: 'Home Delivery',
  pickup: 'Store Pickup',
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (id, product_name, product_price, quantity)`)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) { router.push('/orders'); return }
      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="h-40 rounded-2xl bg-stone-100 animate-pulse" />
        <div className="h-60 rounded-2xl bg-stone-100 animate-pulse" />
      </div>
    )
  }

  if (!order) return null

  const shortId = order.id.split('-')[0].toUpperCase()

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto text-3xl">
          ✅
        </div>
        <h1 className="text-xl font-bold text-green-800" style={{ fontFamily: "'Georgia', serif" }}>
          Order Placed!
        </h1>
        <p className="text-sm text-green-700">
          Thank you, <span className="font-semibold">{order.full_name}</span>! Your order has been received.
        </p>
        <div className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-xl px-4 py-2 mt-2">
          <span className="text-xs text-stone-500">Order ID</span>
          <span className="text-sm font-bold text-stone-800 font-mono">#{shortId}</span>
        </div>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Order Details</h2>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Payment', value: paymentLabels[order.payment_method] ?? order.payment_method },
            { label: 'Delivery', value: deliveryLabels[order.delivery_method] ?? order.delivery_method },
            { label: 'Phone', value: order.phone },
            { label: 'Status', value: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">⏳ {order.status}</span> },
          ].map(({ label, value }) => (
            <div key={label} className="bg-stone-50 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{label}</p>
              <p className="text-sm font-semibold text-stone-700">{value}</p>
            </div>
          ))}
        </div>

        {order.address && (
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Delivery Address</p>
            <p className="text-sm text-stone-700">{order.address}</p>
          </div>
        )}

        {/* GCash / Bank reminder */}
        {order.payment_method === 'gcash' && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs font-bold text-blue-800 mb-1">Next Step — GCash Payment</p>
            <p className="text-xs text-blue-700">Send <span className="font-semibold">₱{order.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span> to <span className="font-semibold">09XX XXX XXXX (Juan Dela Cruz)</span></p>
            <p className="text-xs text-blue-600 mt-1">Use order ID <span className="font-mono font-bold">#{shortId}</span> as your reference.</p>
          </div>
        )}

        {order.payment_method === 'bank' && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-100">
            <p className="text-xs font-bold text-green-800 mb-1">Next Step — Bank Transfer</p>
            <p className="text-xs text-green-700">Transfer <span className="font-semibold">₱{order.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span> to <span className="font-semibold">BDO 1234 5678 9012 (Cocoir-Mart)</span></p>
            <p className="text-xs text-green-600 mt-1">Use order ID <span className="font-mono font-bold">#{shortId}</span> as your reference.</p>
          </div>
        )}

        {/* Items */}
        <div className="border-t border-stone-100 pt-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Items Ordered</p>
          {order.order_items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-stone-600 truncate max-w-[240px]">{item.product_name} × {item.quantity}</span>
              <span className="font-semibold text-stone-800 shrink-0 ml-2">
                ₱{(item.product_price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-stone-800 border-t border-stone-100 pt-2">
            <span>Total</span>
            <span className="text-amber-700">₱{order.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/orders"
          className="flex-1 py-3 bg-stone-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          View My Orders
        </Link>
        <Link href="/products"
          className="flex-1 py-3 border border-stone-200 hover:border-amber-300 text-stone-600 hover:text-stone-800 text-sm font-medium rounded-xl text-center transition-all duration-200">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}