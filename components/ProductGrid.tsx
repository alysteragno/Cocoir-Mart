import ProductCard from './ProductCard'
import { getProducts } from '@/lib/server'

export default async function ProductGrid({ kind }: { kind?: 'featured' }) {
  const products = await getProducts({ featured: kind === 'featured' })

  if (!products?.length) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-stone-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <p className="text-sm font-medium">No products yet</p>
        <p className="text-xs mt-1">Add products from the seller dashboard</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {products.map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}