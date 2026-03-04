'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormState {
  firstName: string
  lastName: string
  email: string
  mobile: string
  address: string
  password: string
  confirmPassword: string
  agree: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  mobile?: string
  address?: string
  password?: string
  confirmPassword?: string
  agree?: string
}

function getStrength(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const strengthMeta = [
  { label: '',       bar: 'w-0',    color: '' },
  { label: 'Weak',   bar: 'w-1/4',  color: 'bg-red-400' },
  { label: 'Fair',   bar: 'w-2/4',  color: 'bg-orange-400' },
  { label: 'Good',   bar: 'w-3/4',  color: 'bg-yellow-400' },
  { label: 'Strong', bar: 'w-full', color: 'bg-green-500' },
]

const inputCls = (err?: string) =>
  `w-full px-4 py-3 rounded-xl border text-stone-800 text-sm bg-white placeholder:text-stone-400
  focus:outline-none focus:ring-2 transition-all duration-200
  ${err
    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15'
    : 'border-stone-300 focus:border-amber-600 focus:ring-amber-600/15'
  }`

function Field({
  label, id, error, hint, children,
}: {
  label: string
  id: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-bold uppercase tracking-[3px] text-amber-700 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '',
    email: '', mobile: '',
    address: '',
    password: '', confirmPassword: '',
    agree: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!/^(\+63|0)[0-9]{10}$/.test(form.mobile)) e.mobile = 'Use format: 09XXXXXXXXX'
    if (!form.address.trim()) e.address = 'Required'
    if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match"
    if (!form.agree) e.agree = 'You must accept the terms'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`,
          mobile: form.mobile,
          address: form.address,
        },
      },
    })
    if (error) {
      setGlobalError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/auth/login'), 2000)
    }
  }

  const strength = getStrength(form.password)
  const sm = strengthMeta[strength]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-900/8 px-8 py-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-stone-800 to-amber-700 flex items-center justify-center text-2xl shadow-lg">
              🥥
            </div>
            <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
              Create your account
            </h1>
            <p className="text-sm text-stone-500 mt-1">Join our community of eco-conscious shoppers</p>
          </div>

          {/* Global error */}
          {globalError && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{globalError}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">Account created!</p>
                <p className="text-xs text-green-700 mt-0.5">Check your email to verify your account. Redirecting to sign in…</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── PERSONAL INFO ── */}
            <div>
              <SectionDivider label="Personal Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" id="firstName" error={errors.firstName}>
                  <input id="firstName" type="text" placeholder="Maria"
                    value={form.firstName} onChange={e => set('firstName', e.target.value)}
                    className={inputCls(errors.firstName)} />
                </Field>
                <Field label="Last Name" id="lastName" error={errors.lastName}>
                  <input id="lastName" type="text" placeholder="Santos"
                    value={form.lastName} onChange={e => set('lastName', e.target.value)}
                    className={inputCls(errors.lastName)} />
                </Field>
                <Field label="Email Address" id="email" error={errors.email}>
                  <input id="email" type="email" placeholder="maria@example.com"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    className={inputCls(errors.email)} />
                </Field>
                <Field label="Mobile Number" id="mobile" error={errors.mobile} hint="Philippine format: 09XXXXXXXXX">
                  <input id="mobile" type="tel" placeholder="09XXXXXXXXX"
                    value={form.mobile} onChange={e => set('mobile', e.target.value)}
                    className={inputCls(errors.mobile)} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Complete Address" id="address" error={errors.address}>
                  <textarea id="address" rows={3}
                    placeholder="House/Unit No., Street, Barangay, City, Province, ZIP Code"
                    value={form.address} onChange={e => set('address', e.target.value)}
                    className={`${inputCls(errors.address)} resize-none`} />
                </Field>
              </div>
            </div>

            {/* ── ACCOUNT SECURITY ── */}
            <div>
              <SectionDivider label="Account Security" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Field label="Password" id="password" error={errors.password}>
                    <input id="password" type="password" placeholder="••••••••"
                      value={form.password} onChange={e => set('password', e.target.value)}
                      className={inputCls(errors.password)} />
                  </Field>
                  {form.password && strength > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${sm.bar} ${sm.color}`} />
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        Strength: <span className="font-medium text-stone-600">{sm.label}</span>
                      </p>
                    </div>
                  )}
                </div>
                <Field label="Confirm Password" id="confirmPassword" error={errors.confirmPassword}>
                  <input id="confirmPassword" type="password" placeholder="••••••••"
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    className={inputCls(errors.confirmPassword)} />
                </Field>
              </div>
            </div>

            {/* ── TERMS ── */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agree}
                  onChange={e => set('agree', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-700 cursor-pointer shrink-0" />
                <span className="text-sm text-stone-600 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-amber-700 font-medium hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-amber-700 font-medium hover:underline">Privacy Policy</Link>.
                  {' '}My personal data will be used to process my orders.
                </span>
              </label>
              {errors.agree && <p className="mt-1.5 text-xs text-red-500 ml-7">{errors.agree}</p>}
            </div>

            {/* ── SUBMIT ── */}
            <button
              type="submit"
              disabled={loading || success}
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
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 text-xs text-stone-400">
            <div className="flex-1 h-px bg-stone-100" />
            or
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-amber-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}