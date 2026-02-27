import ProductCard from './ProductCard'
import { getProducts } from '@/lib/server'

export default async function ProductGrid({ kind }: { kind?: 'featured' }) {
  const products = await getProducts({ featured: kind === 'featured' })
  if (!products?.length) return <p>No products found.</p>
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p: any) => (<ProductCard key={p.id} product={p} />))}
    </div>
  )
}
