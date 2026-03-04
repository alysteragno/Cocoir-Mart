'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = supabaseBrowser()

    // Step 1: check if email exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (!existingUser) {
      setError('Account does not exist. Please register to create an account.')
      setLoading(false)
      return
    }

    // Step 2: attempt sign in
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
      return
    }

    // Step 3: fetch role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setError('Could not load your profile. Please try again.')
      setLoading(false)
      return
    }

    // Step 4: redirect based on role
    if (profile.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-900/8 px-8 py-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-stone-800 to-amber-700 flex items-center justify-center text-2xl shadow-lg">
              🥥
            </div>
            <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
              Welcome back
            </h1>
            <p className="text-sm text-stone-500 mt-1">Sign in to your Cocoir-Mart account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-red-600">
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm
                  placeholder:text-stone-400 focus:outline-none focus:border-amber-600
                  focus:ring-2 focus:ring-amber-600/15 transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-amber-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm
                  placeholder:text-stone-400 focus:outline-none focus:border-amber-600
                  focus:ring-2 focus:ring-amber-600/15 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-900
                text-amber-50 text-sm font-semibold rounded-xl transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg shadow-stone-900/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-xs text-stone-400">
            <div className="flex-1 h-px bg-stone-100" />
            or
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <p className="text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-amber-700 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}