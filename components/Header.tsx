import Link from 'next/link'
import Icon from './Icon'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-amber-50 border-b border-amber-100 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-800 to-amber-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Image 
                src="/Logo.jpg" 
                alt="Cocoir-Mart" 
                width={50} 
                height={50} 
              />
            </div>
            <span
              className="font-bold text-lg text-stone-800 tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Cocoir-Mart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-stone-600">
            {[
              { href: '/',         label: 'Home' },
              { href: '/products', label: 'Products' },
              { href: '/orders',   label: 'Orders' },
              { href: '/seller',   label: 'Seller' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg hover:bg-amber-100 hover:text-stone-900 transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-amber-100 text-stone-600 hover:text-stone-900 transition-colors duration-150"
              aria-label="View cart"
            >
              <Icon src="/cart.svg" 
                alt="Cart" 
                width={25} 
                height={25} />
              {/* Cart badge */}
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-stone-200 mx-1" />

            {/* Register / Profile icon */}
            <Link
              href="/auth/register"
              className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-amber-100 transition-colors duration-150"
              aria-label="Register"
            >
              <Icon src="/register.svg" alt="Register" width={22} height={22} />
            </Link>

            {/* Login button */}
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-50 text-sm font-medium rounded-xl transition-colors duration-150 shadow-sm"
            >
              Sign In
            </Link>

          </div>
        </div>
      </div>
    </header>
  )
}