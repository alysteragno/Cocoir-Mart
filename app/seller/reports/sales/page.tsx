'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Image from 'next/image'

interface Order {
  id: string
  subtotal: number
  payment_method: string
  created_at: string
}

interface OrderItem {
  product_id: string
  product_name: string
  image_url: string | null
  quantity: number
  product_price: number
}

interface DailySales {
  date: string
  revenue: number
  orders: number
}

interface TopProduct {
  product_id: string
  product_name: string
  image_url: string | null
  total_sold: number
  total_revenue: number
}

const paymentLabels: Record<string, string> = {
  cod:   'Cash on Delivery',
  gcash: 'GCash',
  bank:  'Bank Transfer',
}

const paymentColors: Record<string, string> = {
  cod:   'bg-amber-500',
  gcash: 'bg-blue-500',
  bank:  'bg-green-500',
}

export default function SalesReportPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [paymentBreakdown, setPaymentBreakdown] = useState<{ method: string; count: number; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7' | '30' | 'all'>('30')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const supabase = supabaseBrowser()

      let query = supabase.from('orders').select('id, subtotal, payment_method, created_at')
      if (range !== 'all') {
        const from = new Date()
        from.setDate(from.getDate() - parseInt(range))
        query = query.gte('created_at', from.toISOString())
      }
      const { data: ordersData } = await query.order('created_at', { ascending: true })
      setOrders(ordersData ?? [])

      // Order items for top products
      let itemQuery = supabase.from('order_items').select('product_id, product_name, image_url, quantity, product_price')
      const { data: items } = await itemQuery

      // Top products
      const map: Record<string, TopProduct> = {}
      items?.forEach((i: OrderItem) => {
        if (!map[i.product_id]) {
          map[i.product_id] = { product_id: i.product_id, product_name: i.product_name, image_url: i.image_url, total_sold: 0, total_revenue: 0 }
        }
        map[i.product_id].total_sold += i.quantity
        map[i.product_id].total_revenue += i.quantity * i.product_price
      })
      setTopProducts(Object.values(map).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5))

      // Daily sales
      const dailyMap: Record<string, DailySales> = {}
      ordersData?.forEach(o => {
        const date = new Date(o.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
        if (!dailyMap[date]) dailyMap[date] = { date, revenue: 0, orders: 0 }
        dailyMap[date].revenue += o.subtotal
        dailyMap[date].orders += 1
      })
      setDailySales(Object.values(dailyMap).slice(-14))

      // Payment breakdown
      const pmMap: Record<string, { count: number; revenue: number }> = {}
      ordersData?.forEach(o => {
        if (!pmMap[o.payment_method]) pmMap[o.payment_method] = { count: 0, revenue: 0 }
        pmMap[o.payment_method].count += 1
        pmMap[o.payment_method].revenue += o.subtotal
      })
      setPaymentBreakdown(Object.entries(pmMap).map(([method, v]) => ({ method, ...v })))

      setLoading(false)
    }
    fetch()
  }, [range])

  const totalRevenue = orders.reduce((s, o) => s + o.subtotal, 0)
  const totalOrders = orders.length
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-stone-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header + range filter */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Sales Report</h1>
          <p className="text-sm text-stone-400 mt-0.5">Revenue, orders, and product performance</p>
        </div>
        <div className="flex items-center gap-2">
          {[{ key: '7', label: 'Last 7 days' }, { key: '30', label: 'Last 30 days' }, { key: 'all', label: 'All time' }].map(({ key, label }) => (
            <button key={key} onClick={() => setRange(key as '7' | '30' | 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${range === key ? 'bg-stone-800 text-amber-50' : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: '💰', color: 'bg-amber-50 border-amber-100' },
          { label: 'Total Orders', value: totalOrders, icon: '📦', color: 'bg-blue-50 border-blue-100' },
          { label: 'Avg. Order Value', value: `₱${avgOrder.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: '📊', color: 'bg-green-50 border-green-100' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-2xl border p-4 ${color}`}>
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-xl font-bold text-stone-800">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Orders over time — bar chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Revenue Over Time</h2>
        {dailySales.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">No data for this period</p>
        ) : (
          <div className="space-y-2">
            {dailySales.map(d => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-xs text-stone-400 w-16 shrink-0">{d.date}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-stone-700 to-amber-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%` }}
                  >
                    {(d.revenue / maxRevenue) > 0.3 && (
                      <span className="text-[10px] font-bold text-white">₱{d.revenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-stone-600 w-20 shrink-0 text-right">
                  ₱{d.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Revenue by payment method */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
          <h2 className="font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>By Payment Method</h2>
          {paymentBreakdown.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">No data</p>
          ) : (
            <div className="space-y-3">
              {paymentBreakdown.map(p => {
                const pct = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0
                return (
                  <div key={p.method} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-stone-700">{paymentLabels[p.method] ?? p.method}</span>
                      <span className="text-stone-400">{p.count} orders · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${paymentColors[p.method] ?? 'bg-stone-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-amber-700">₱{p.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Best selling products */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
          <h2 className="font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Best Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.product_id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-400 w-4">#{i + 1}</span>
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    {p.image_url
                      ? <Image src={p.image_url} alt={p.product_name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{p.product_name}</p>
                    <p className="text-xs text-stone-400">{p.total_sold} units</p>
                  </div>
                  <p className="text-sm font-bold text-amber-700 shrink-0">
                    ₱{p.total_revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}