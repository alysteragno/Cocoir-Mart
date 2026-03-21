'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string
  created_at: string
}

export default function SellerUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = supabaseBrowser()
      const { data } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role, created_at')
        .order('created_at', { ascending: false })
      setUsers(data ?? [])
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const handleDelete = async (userId: string) => {
    setDeletingId(userId)
    const supabase = supabaseBrowser()
    await supabase.from('users').delete().eq('id', userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
    setDeletingId(null)
    setConfirmId(null)
  }

  const filtered = users.filter(u => {
    const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase()
    const email = (u.email ?? '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const totalAdmins = users.filter(u => u.role === 'admin').length
  const totalCustomers = users.filter(u => u.role === 'customer').length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>Users</h1>
          <p className="text-sm text-stone-400 mt-0.5">Manage all registered users</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-stone-100 text-stone-700' },
          { label: 'Customers', value: totalCustomers, color: 'bg-amber-50 text-amber-700' },
          { label: 'Admins', value: totalAdmins, color: 'bg-blue-50 text-blue-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800
            placeholder:text-stone-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-stone-50 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">👤</p>
            <p className="text-stone-500 font-medium">{search ? 'No users match your search' : 'No users yet'}</p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-sm text-amber-700 hover:underline font-medium">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-stone-100 bg-stone-50">
              <p className="col-span-4 text-xs font-bold uppercase tracking-widest text-stone-400">User</p>
              <p className="col-span-3 text-xs font-bold uppercase tracking-widest text-stone-400">Email</p>
              <p className="col-span-2 text-xs font-bold uppercase tracking-widest text-stone-400">Role</p>
              <p className="col-span-2 text-xs font-bold uppercase tracking-widest text-stone-400">Joined</p>
              <p className="col-span-1 text-xs font-bold uppercase tracking-widest text-stone-400"></p>
            </div>

            {/* Rows */}
            {filtered.map((user, i) => {
              const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unknown'
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              const joined = new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
              const isDeleting = deletingId === user.id
              const isConfirming = confirmId === user.id

              return (
                <div key={user.id}
                  className={`grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-stone-50 last:border-0
                    transition-opacity duration-200 ${isDeleting ? 'opacity-40' : 'opacity-100'}`}
                  style={{ animation: 'fadeIn 200ms ease forwards', animationDelay: `${i * 30}ms`, opacity: 0 }}
                >
                  {/* Avatar + name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-700 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <p className="text-sm font-semibold text-stone-800 truncate">{name}</p>
                  </div>

                  {/* Email */}
                  <p className="col-span-3 text-sm text-stone-500 truncate">{user.email ?? '—'}</p>

                  {/* Role badge */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                      ${user.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-50 text-amber-700'}`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Date joined */}
                  <p className="col-span-2 text-xs text-stone-400">{joined}</p>

                  {/* Delete */}
                  <div className="col-span-1 flex justify-end">
                    {user.role === 'admin' ? (
                      <span className="text-xs text-stone-300 font-medium">—</span>
                    ) : isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={isDeleting}
                          className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors">
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-[10px] font-bold text-stone-500 hover:text-stone-700 px-2 py-1 rounded-lg border border-stone-200 transition-colors">
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(user.id)}
                        className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-400 text-right">
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}