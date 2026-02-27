import Link from 'next/link'
import ProductGrid from '@/components/ProductGrid'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-10 bg-amber-50 rounded-md">
        <h1 className="text-3xl font-bold">Coconut Coir Shop</h1>
        <p className="mt-2 text-gray-600">Sustainable coir products for construction, gardening, and more.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/products" className="px-4 py-2 bg-amber-600 text-white rounded">Browse Products</Link>
          <Link href="/seller" className="px-4 py-2 border rounded">Seller Dashboard</Link>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Featured</h2>
        <ProductGrid kind="featured" />
      </section>
    </div>
  )
}
