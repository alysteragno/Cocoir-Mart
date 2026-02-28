import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Cocoir-Mart" className="h-8 w-8" />
              <span className="font-semibold text-lg">Cocoir-Mart</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <nav className="flex items-center gap-4 text-sm text-gray-700">
              <Link href="/" className="hover:text-gray-900">Home</Link>
              <Link href="/products" className="hover:text-gray-900">Products</Link>
              <Link href="/orders" className="hover:text-gray-900">Orders</Link>
              <Link href="/seller" className="hover:text-gray-900">Seller</Link>
            </nav>

            {/* Search + Cart */}
            <div className="flex items-center gap-4">
              <label className="relative hidden sm:block">
                <input
                  type="search"
                  placeholder="Search products"
                  className="w-64 rounded-md border px-3 py-1 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <Link
                href="/cart"
                className="relative inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                  />
                </svg>
                <span className="sr-only">View cart</span>
                <span className="hidden sm:inline">Cart</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}