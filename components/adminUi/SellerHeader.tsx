'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

const navItems = [
  {
    href: '/seller/dashboard',
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/seller/products',
    label: 'Products',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
  },
  {
    href: '/seller/orders',
    label: 'Orders',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/seller/users',
    label: 'Users',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/seller/reports',
    label: 'Reports',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function SellerHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [adminName, setAdminName] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const supabase = supabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setAdminName(session.user.user_metadata?.first_name || 'Admin')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-stone-900 border-b border-stone-800 shadow-xl shadow-stone-950/50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/seller/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
              🥥
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-amber-50 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Cocoir-Mart
              </span>
              <span className="ml-2 text-[9px] font-bold uppercase tracking-[3px] text-amber-600 bg-amber-600/10 border border-amber-600/20 px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ href, label, icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                    ${active
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-600/20'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                >
                  {icon}
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-stone-400
                hover:bg-stone-800 hover:text-stone-200 transition-colors border border-stone-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Store
            </Link>

            {/* Admin dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center text-white text-[10px] font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-medium text-stone-300 max-w-[80px] truncate">
                  {adminName}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`w-3 h-3 text-stone-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-10 w-44 bg-stone-900 border border-stone-700 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden"
                    style={{ animation: 'dropIn 150ms ease forwards' }}>
                    <div className="px-3 py-2 border-b border-stone-800">
                      <p className="text-xs font-semibold text-stone-200">{adminName}</p>
                      <p className="text-[10px] text-amber-600 uppercase tracking-widest">Administrator</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-red-400 hover:bg-red-950/40 transition-colors mt-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-1.5 rounded-lg text-stone-400 hover:bg-stone-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-stone-800 py-2 flex flex-col gap-1">
            {navItems.map(({ href, label, icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                >
                  {icon}
                  {label}
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      <style jsx>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  )
}