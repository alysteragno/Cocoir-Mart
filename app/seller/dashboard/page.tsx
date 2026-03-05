'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface Stats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
}

interface RecentUser {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = supabaseBrowser()

    const init = async () => {
      const [productsRes, usersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('users').select('id, first_name, last_name, email, role, created_at', { count: 'exact' })
          .order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalProducts: productsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        totalOrders: 0,
        totalRevenue: 0,
      })

      setRecentUsers(usersRes.data ?? [])
      setLoading(false)
    }

    init()
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: '📦', href: '/seller/products', color: 'from-amber-500/20 to-amber-600/5 border-amber-500/20', text: 'text-amber-400' },
    { label: 'Total Users',    value: stats.totalUsers,    icon: '👥', href: '/seller/users',    color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',   text: 'text-blue-400' },
    { label: 'Total Orders',   value: stats.totalOrders,   icon: '🛒', href: '/seller/orders',   color: 'from-green-500/20 to-green-600/5 border-green-500/20', text: 'text-green-400' },
    { label: 'Total Revenue',  value: `₱${stats.totalRevenue.toLocaleString('en-PH')}`, icon: '💰', href: '/seller/reports', color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20', text: 'text-purple-400' },
  ]

  const quickActions = [
    { label: 'Add Product',  href: '/seller/products/new', icon: '➕' },
    { label: 'View Orders',  href: '/seller/orders',       icon: '📋' },
    { label: 'Manage Users', href: '/seller/users',        icon: '👤' },
    { label: 'View Reports', href: '/seller/reports',      icon: '📊' },
  ]

  return (
    <div className="space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-stone-100" style={{ fontFamily: "'Georgia', serif" }}>
          Overview
        </h1>
        <p className="text-sm text-stone-500 mt-1">Here's what's happening in your store.</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, href, color, text }, i) => (
          <Link
            key={label}
            href={href}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${color}
              p-5 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg hover:shadow-stone-950/50`}
            style={{ opacity: loading ? 0.4 : 1, transition: `opacity 400ms ease ${i * 80}ms, transform 200ms ease` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-stone-700 group-hover:text-stone-400 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className={`text-2xl font-bold ${text}`} style={{ fontFamily: "'Georgia', serif" }}>
              {loading ? '—' : value}
            </p>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest">{label}</p>
          </Link>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[3px] text-stone-500 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-stone-900 border border-stone-800
                hover:border-amber-600/40 hover:bg-stone-800/80 transition-all duration-200 hover:-translate-y-0.5"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-stone-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RECENT USERS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[3px] text-stone-500">Recent Users</h2>
          <Link href="/seller/users" className="text-xs text-amber-600 hover:text-amber-500 transition-colors">
            View all →
          </Link>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-stone-600 text-sm">Loading…</div>
          ) : recentUsers.length === 0 ? (
            <div className="p-8 text-center text-stone-600 text-sm">No users yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-500">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-500 hidden sm:table-cell">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-500">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-500 hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user, i) => (
                    <tr
                      key={user.id}
                      className="border-b border-stone-800/50 last:border-0 hover:bg-stone-800/40 transition-colors"
                      style={{ opacity: 0, animation: `fadeIn 300ms ease forwards`, animationDelay: `${i * 60}ms` }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-700 to-amber-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.first_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-stone-200 font-medium">{user.first_name} {user.last_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-400 hidden sm:table-cell">{user.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                          ${user.role === 'admin'
                            ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-stone-500 text-xs hidden md:table-cell">
                        {new Date(user.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}