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
    { label: 'Total Products', value: stats.totalProducts, icon: '📦', href: '/seller/products', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    { label: 'Total Users',    value: stats.totalUsers,    icon: '👥', href: '/seller/users',    bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700' },
    { label: 'Total Orders',   value: stats.totalOrders,   icon: '🛒', href: '/seller/orders',   bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
    { label: 'Total Revenue',  value: `₱${stats.totalRevenue.toLocaleString('en-PH')}`, icon: '💰', href: '/seller/reports', bg: 'bg-stone-50 border-stone-200', text: 'text-stone-700' },
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
        <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 mb-1">Admin Panel</p>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
          Overview
        </h1>
        <p className="text-sm text-stone-500 mt-1">Here&apos;s what&apos;s happening in your store.</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, href, bg, text }, i) => (
          <Link
            key={label}
            href={href}
            className={`group relative overflow-hidden rounded-2xl border ${bg}
              p-5 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md`}
            style={{ opacity: loading ? 0.5 : 1, transition: `opacity 400ms ease ${i * 80}ms, transform 200ms ease` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className={`text-2xl font-bold ${text}`} style={{ fontFamily: "'Georgia', serif" }}>
              {loading ? '—' : value}
            </p>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">{label}</p>
          </Link>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[3px] text-stone-400 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-stone-200
                hover:border-amber-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-stone-600">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RECENT USERS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[3px] text-stone-400">Recent Users</h2>
          <Link href="/seller/users" className="text-xs text-amber-700 hover:text-amber-600 transition-colors">
            View all →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
          ) : recentUsers.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">No users yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400 hidden sm:table-cell">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400 hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user, i) => (
                    <tr
                      key={user.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-amber-50/50 transition-colors"
                      style={{ opacity: 0, animation: `fadeIn 300ms ease forwards`, animationDelay: `${i * 60}ms` }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-600 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.first_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-stone-700 font-medium">{user.first_name} {user.last_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500 hidden sm:table-cell">{user.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                          ${user.role === 'admin'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-stone-400 text-xs hidden md:table-cell">
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