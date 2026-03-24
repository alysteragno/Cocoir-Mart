'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Image from 'next/image'

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
    href: '/seller/reports/inventory',
    label: 'Inventory',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/seller/reports/sales',
    label: 'Sales',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
  const [dropdownVisible, setDropdownVisible] = useState(false)

  useEffect(() => {
    const supabase = supabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setAdminName(session.user.user_metadata?.first_name || 'Admin')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (dropdownOpen) requestAnimationFrame(() => setDropdownVisible(true))
    else setDropdownVisible(false)
  }, [dropdownOpen])

  const handleLogout = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const closeDropdown = () => {
    setDropdownVisible(false)
    setTimeout(() => setDropdownOpen(false), 150)
  }

  return (
    <header className="sticky top-0 z-50 bg-amber-50 border-b border-amber-100 shadow-sm relative">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/seller/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-800 to-amber-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              <Image src="/Logo.jpg" alt="Cocoir-Mart" width={50} height={50} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-stone-800 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Cocoir-Mart
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
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
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'text-stone-500 hover:bg-amber-100 hover:text-stone-800'
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
            {/* Admin dropdown */}
            <div className="relative">
              <button
                onClick={() => dropdownOpen ? closeDropdown() : setDropdownOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors duration-150"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-700 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-[80px] truncate">
                  {adminName}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-stone-400 transition-transform duration-300"
                  style={{ transform: dropdownVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeDropdown} />
                  <div
                    className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-900/10 py-2 z-50 overflow-hidden"
                    style={{
                      opacity: dropdownVisible ? 1 : 0,
                      transform: dropdownVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                      transition: 'opacity 150ms ease, transform 150ms ease',
                      transformOrigin: 'top right',
                    }}
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-800">{adminName}</p>
                      <p className="text-[10px] text-amber-700 uppercase tracking-widest mt-0.5">Administrator</p>
                    </div>

                    <Link href="/products" onClick={closeDropdown}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-stone-900 transition-colors"
                      style={{
                        opacity: dropdownVisible ? 1 : 0,
                        transform: dropdownVisible ? 'translateX(0)' : 'translateX(-6px)',
                        transition: 'opacity 200ms ease 80ms, transform 200ms ease 80ms',
                      }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Store
                    </Link>

                    <div className="border-t border-stone-100 mt-1 pt-1"
                      style={{
                        opacity: dropdownVisible ? 1 : 0,
                        transform: dropdownVisible ? 'translateX(0)' : 'translateX(-6px)',
                        transition: 'opacity 200ms ease 120ms, transform 200ms ease 120ms',
                      }}>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile burger */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(o => !o)}
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-amber-100 text-stone-700 transition-colors duration-150"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <Image src="/Burger.svg" alt="Menu" width={25} height={25} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden absolute top-16 left-0 right-0 border-t border-amber-100 bg-amber-50 px-4 pb-4 pt-2 space-y-1 shadow-md z-50
            transition-all duration-300 ease-in-out origin-top
            ${mobileOpen
              ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
            }`}
        >
          {navItems.map(({ href, label }, i) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-end gap-2 text-right px-4 py-2.5 rounded-xl text-sm font-medium
                  hover:bg-amber-100 hover:text-stone-900 transition-all duration-200
                  ${active ? 'bg-amber-100 text-amber-800' : 'text-stone-700'}
                  ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                style={{ transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms' }}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}