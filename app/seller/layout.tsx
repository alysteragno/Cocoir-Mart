import type { ReactNode } from 'react'
import Link from 'next/link'

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid md:grid-cols-5 gap-6">
      <aside className="md:col-span-1 space-y-2">
        <h2 className="font-semibold">Seller</h2>
        <nav className="flex flex-col gap-1">
          <Link href="/seller">Dashboard</Link>
          <Link href="/seller/products">Products</Link>
          <Link href="/seller/reports/sales">Sales Reports</Link>
          <Link href="/seller/reports/inventory">Inventory Report</Link>
        </nav>
      </aside>
      <section className="md:col-span-4">{children}</section>
    </div>
  )
}
