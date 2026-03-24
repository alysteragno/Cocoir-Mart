import Link from 'next/link'
import Image from 'next/image'
import MobileMenu from './Burger'
import UserMenu from './UserMenu'

export default function Header({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="bg-amber-50 border-b border-amber-100 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-800 to-amber-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              <Image src="/Logo.jpg" alt="Cocoir-Mart" width={50} height={50} />
            </div>
            <span className="font-bold text-lg text-stone-800 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
              Cocoir-Mart
            </span>
          </Link>

          {/* Desktop nav — hidden on minimal (auth pages) */}
          {!minimal && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-stone-600">
              {[
                { href: '/',         label: 'Home' },
                { href: '/products', label: 'Products' },
                { href: '/orders',   label: 'Orders' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="px-3 py-1.5 rounded-lg hover:bg-amber-100 hover:text-stone-900 transition-colors duration-150">
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right actions — hidden on minimal */}
          {!minimal ? (
            <div className="flex items-center gap-2">
              <UserMenu />
              <MobileMenu />
            </div>
          ) : (
            /* Auth pages — just show login link */
            <Link href="/auth/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              Sign in
            </Link>
          )}

        </div>
      </div>
    </header>
  )
}