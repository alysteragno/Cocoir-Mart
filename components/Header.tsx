import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Group Logo" className="h-8 w-8" />
          <span className="font-semibold">Popeyes</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Transactions</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </nav>
      </div>
    </header>
  )
}
