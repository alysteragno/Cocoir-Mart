'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image_url: string | null
  category: string | null
}

interface TopProduct {
  product_id: string
  product_name: string
  image_url: string | null
  total_sold: number
  total_revenue: number
}

export default function InventoryReportPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalSold: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = supabaseBrowser()

      // All products for stock
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, price, stock, image_url, category')
        .order('stock', { ascending: true })
      setProducts(prods ?? [])

      // Orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('subtotal')
      const totalRevenue = orders?.reduce((s, o) => s + o.subtotal, 0) ?? 0
      const totalOrders = orders?.length ?? 0

      // Order items for top products + total sold
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, product_name, image_url, quantity, product_price')

      const totalSold = items?.reduce((s, i) => s + i.quantity, 0) ?? 0

      // Aggregate by product
      const map: Record<string, TopProduct> = {}
      items?.forEach(i => {
        if (!map[i.product_id]) {
          map[i.product_id] = { product_id: i.product_id, product_name: i.product_name, image_url: i.image_url, total_sold: 0, total_revenue: 0 }
        }
        map[i.product_id].total_sold += i.quantity
        map[i.product_id].total_revenue += i.quantity * i.product_price
      })
      const top = Object.values(map).sort((a, b) => b.total_sold - a.total_sold).slice(0, 5)

      setTopProducts(top)
      setStats({ totalRevenue, totalOrders, totalSold })
      setLoading(false)
    }
    fetch()
  }, [])

  const lowStock = products.filter(p => p.stock <= 10)
  const outOfStock = products.filter(p => p.stock === 0)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-stone-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Inventory Report</h1>
        <p className="text-sm text-stone-400 mt-0.5">Stock levels, top sellers, and order summary</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₱${stats.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: '💰', color: 'bg-amber-50 border-amber-100' },
          { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-blue-50 border-blue-100' },
          { label: 'Units Sold', value: stats.totalSold, icon: '🛒', color: 'bg-green-50 border-green-100' },
          { label: 'Low Stock Items', value: lowStock.length, icon: '⚠️', color: 'bg-red-50 border-red-100' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-2xl border p-4 ${color}`}>
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-xl font-bold text-stone-800">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Top selling products */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">No sales data yet</p>
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
                  <p className="text-xs text-stone-400">{p.total_sold} units sold</p>
                </div>
                <p className="text-sm font-bold text-amber-700 shrink-0">
                  ₱{p.total_revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low stock alerts */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
            Stock Alerts
            {lowStock.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">{lowStock.length} items</span>
            )}
          </h2>
          <Link href="/seller/products" className="text-xs text-amber-700 hover:underline font-medium">Manage Products →</Link>
        </div>

        {lowStock.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm text-stone-400">All products are well stocked</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  {p.image_url
                    ? <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{p.name}</p>
                  {p.category && <p className="text-xs text-stone-400">{p.category}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold
                    ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}