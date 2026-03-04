'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function HeroCTA() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const supabase = supabaseBrowser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user)
      setMounted(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500
          text-white text-sm font-semibold rounded-xl transition-all duration-200
          shadow-lg shadow-amber-900/30 hover:-translate-y-0.5"
      >
        Browse Products
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Only show Create Account when NOT logged in */}
      {mounted && !loggedIn && (
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15
            text-amber-50 text-sm font-semibold rounded-xl border border-white/10
            transition-all duration-200 hover:-translate-y-0.5"
        >
          Create Account
        </Link>
      )}
    </div>
  )
}