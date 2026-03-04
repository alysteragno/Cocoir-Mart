'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function WelcomeBanner() {
  const [user, setUser] = useState<{ firstName: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const supabase = supabaseBrowser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const firstName = session.user.user_metadata?.first_name
          || session.user.email?.split('@')[0]
          || 'there'
        setUser({ firstName })
        // Small delay so the animation is visible on page load
        setTimeout(() => setVisible(true), 100)
      } else {
        setVisible(false)
        setTimeout(() => setUser(null), 300)
      }
      setMounted(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!mounted || !user) return null

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 400ms ease, transform 400ms ease',
      }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-800 to-amber-800 px-6 py-4 flex items-center justify-between gap-4"
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg,#c8a46e 0,#c8a46e 1px,transparent 1px,transparent 16px)',
        }}
      />

      {/* Left — avatar + text */}
      <div className="relative flex items-center gap-3">
        {/* Avatar with pulse ring */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
          <div className="relative w-9 h-9 rounded-full bg-amber-500/30 border border-amber-400/30 flex items-center justify-center text-amber-200 font-bold text-sm">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
        </div>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'opacity 400ms ease 150ms, transform 400ms ease 150ms',
          }}
        >
          <p className="text-amber-50 font-semibold text-sm">
            Welcome back, <span className="text-amber-300">{user.firstName}!</span> 👋
          </p>
          <p className="text-stone-400 text-xs mt-0.5">
            Ready to shop? Browse our latest coir products.
          </p>
        </div>
      </div>

      {/* Right — CTA button */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : 'translateX(8px)',
          transition: 'opacity 400ms ease 250ms, transform 400ms ease 250ms',
        }}
      >
        <Link
          href="/products"
          className="relative shrink-0 hidden sm:inline-flex items-center gap-1.5 px-4 py-2
            bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30
            text-amber-200 text-xs font-semibold rounded-xl transition-all duration-200
            hover:-translate-y-0.5"
        >
          Shop Now
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}