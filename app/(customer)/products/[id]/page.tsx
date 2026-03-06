import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/server'

interface Params { params: { slug: string } }

export default async function ProductDetailPage({ params }: Params) {
  const product = await getProductBySlug(params.slug)
  if (!product) return notFound()

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} className="w-full rounded" />
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-xl font-semibold mt-4">₱{product.price.toFixed(2)}</p>
      </div>
    </div>
  )
}