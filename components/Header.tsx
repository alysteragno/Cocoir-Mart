import Link from 'next/link'
import Image from 'next/image'
import MobileMenu from './Burger'
import UserMenu from './UserMenu'

interface HeaderProps {
  minimal?: boolean
}

export default function Header({ minimal = false }: HeaderProps) {
  return (
    <header className="bg-amber-50 border-b border-amber-100 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo — always shown */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-800 to-amber-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Image src="/Logo.jpg" alt="Cocoir-Mart" width={50} height={50} />
            </div>
            <span className="font-bold text-lg text-stone-800 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
              Cocoir-Mart
            </span>
          </Link>

          {/* Everything else hidden in minimal mode */}
          {!minimal && (
            <div className="flex items-center gap-2 flex-1 justify-end">
              {/* UserMenu handles nav, cart, and auth buttons based on login state */}
              <UserMenu />
              <MobileMenu />
            </div>
          )}

        </div>
      </div>
    </header>
  )
}