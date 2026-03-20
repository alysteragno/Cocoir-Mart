'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Icon from './Icon'

export default function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const supabase = supabaseBrowser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata
        const email = session.user.email ?? ''
        const firstName = meta?.first_name || email.split('@')[0]
        setUser({ firstName, email })
      } else {
        setUser(null)
      }
      setMounted(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (dropdownOpen) requestAnimationFrame(() => setVisible(true))
    else setVisible(false)
  }, [dropdownOpen])

  const handleLogout = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const closeDropdown = () => {
    setVisible(false)
    setTimeout(() => setDropdownOpen(false), 150)
  }

  if (!mounted) return <div className="w-9 h-9 rounded-xl bg-amber-100 animate-pulse" />

  // ── LOGGED OUT — no cart ──
  if (!user) {
    return (
      <>
        <div className="w-px h-5 bg-stone-200 mx-1" />
        <Link href="/auth/login"
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-amber-100 transition-colors duration-150"
          aria-label="Login">
          <Icon src="/register.svg" alt="Login" width={22} height={22} />
        </Link>
        <Link href="/auth/register"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-50 text-sm font-medium rounded-xl transition-colors duration-150 shadow-sm">
          Register
        </Link>
      </>
    )
  }

  // ── LOGGED IN — show cart ──
  return (
    <>
      {/* Cart — only when logged in */}
      <Link
        href="/cart"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-amber-100 text-stone-600 hover:text-stone-900 transition-colors duration-150"
        aria-label="View cart"
      >
        <Icon src="/cart.svg" alt="Cart" width={25} height={25} />
      </Link>

      <div className="w-px h-5 bg-stone-200 mx-1" />

      {/* Avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => dropdownOpen ? closeDropdown() : setDropdownOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors duration-150"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-700 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-[100px] truncate">
            {user.firstName}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-stone-400 transition-transform duration-300"
            style={{ transform: visible ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                transition: 'opacity 150ms ease, transform 150ms ease',
                transformOrigin: 'top right',
              }}
            >
              <div className="px-4 py-2.5 border-b border-stone-100">
                <p className="text-sm font-semibold text-stone-800">{user.firstName}</p>
                <p className="text-xs text-stone-400 truncate">{user.email}</p>
              </div>

              {[
                { href: '/profile', label: 'My Profile', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
                { href: '/orders',  label: 'My Orders',  icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
              ].map(({ href, label, icon }, i) => (
                <Link key={href} href={href} onClick={closeDropdown}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-stone-900 transition-colors"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-6px)',
                    transition: `opacity 200ms ease ${80 + i * 40}ms, transform 200ms ease ${80 + i * 40}ms`,
                  }}>
                  {icon}{label}
                </Link>
              ))}

              <div className="border-t border-stone-100 mt-1 pt-1"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-6px)',
                  transition: 'opacity 200ms ease 160ms, transform 200ms ease 160ms',
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
    </>
  )
}