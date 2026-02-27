'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', password: '', confirm: '', name: '', address: '', mobile: ''
  })
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm) return setError('Passwords do not match')
    const supabase = supabaseBrowser()
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, address: form.address, mobile: form.mobile, role: 'buyer' } }
    })
    if (error) setError(error.message)
    else router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
        <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Confirm Password" type="password" value={form.confirm} onChange={e=>setForm({...form, confirm: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Complete Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Address" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Mobile Number" value={form.mobile} onChange={e=>setForm({...form, mobile: e.target.value})} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-amber-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  )
}
