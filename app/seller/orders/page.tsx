'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface OrderItem {
  product_name: string
  quantity: number
  product_price: number
}

interface Order {
  id: string
  status: string
  payment_method: string
  delivery_method: string
  full_name: string
  phone: string
  subtotal: number
  created_at: string
  order_items: OrderItem[]
}

const STATUSES = ['pending', 'delivered']

const statusStyles: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
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

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = supabaseBrowser()
      const { data } = await supabase
        .from('orders')
        .select(`*, order_items (product_name, quantity, product_price)`)
        .order('created_at', { ascending: false })
      setOrders((data as unknown as Order[]) ?? [])
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const supabase = supabaseBrowser()
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setUpdatingId(null)
  }

  const filtered = orders.filter(o => {
    const matchSearch =
      o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const shortId = (id: string) => id.split('-')[0].toUpperCase()

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Orders</h1>
          <p className="text-sm text-stone-400 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: 'Pending' },
          { key: 'delivered', label: 'Delivered' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2
              ${filterStatus === key
                ? 'bg-stone-800 text-amber-50'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
              ${filterStatus === key ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
              {counts[key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by customer or order ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800
            placeholder:text-stone-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-stone-200">
          <p className="text-3xl mb-3">📦</p>
          <p className="text-stone-500 font-medium">No orders found</p>
          {(search || filterStatus !== 'all') && (
            <button onClick={() => { setSearch(''); setFilterStatus('all') }}
              className="mt-3 text-sm text-amber-700 hover:underline font-medium">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Delivery', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-stone-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(order => (
                  <tr key={order.id} className={`hover:bg-stone-50 transition-colors ${updatingId === order.id ? 'opacity-50' : ''}`}>

                    {/* Order ID */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-stone-600">#{shortId(order.id)}</span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-stone-800">{order.full_name}</p>
                      <p className="text-xs text-stone-400">{order.phone}</p>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3.5 max-w-[180px]">
                      {order.order_items.map((item, i) => (
                        <p key={i} className="text-xs text-stone-600 truncate">
                          {item.product_name} × {item.quantity}
                        </p>
                      ))}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-amber-700">
                        ₱{order.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-stone-600">{paymentLabels[order.payment_method] ?? order.payment_method}</span>
                    </td>

                    {/* Delivery */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-stone-600">{deliveryLabels[order.delivery_method] ?? order.delivery_method}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-stone-400">
                        {new Date(order.created_at).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Status dropdown */}
                    <td className="px-4 py-3.5">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all
                          ${statusStyles[order.status] ?? 'bg-stone-100 text-stone-600'}`}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s} className="bg-white text-stone-800 font-normal">
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-stone-100">
            {filtered.map(order => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-500">#{shortId(order.id)}</span>
                    <p className="font-semibold text-stone-800 mt-0.5">{order.full_name}</p>
                    <p className="text-xs text-stone-400">{order.phone}</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer
                      focus:outline-none ${statusStyles[order.status] ?? 'bg-stone-100 text-stone-600'}`}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s} className="bg-white text-stone-800 font-normal">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  {order.order_items.map((item, i) => (
                    <p key={i} className="text-xs text-stone-600">{item.product_name} × {item.quantity}</p>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>{paymentLabels[order.payment_method] ?? order.payment_method} · {deliveryLabels[order.delivery_method] ?? order.delivery_method}</span>
                  <span className="font-bold text-amber-700">₱{order.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>

                <p className="text-xs text-stone-300">
                  {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-stone-400 text-right">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  )
}