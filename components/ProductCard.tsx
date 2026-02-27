import Link from 'next/link'

type Props = {
  product: {
    id: number
    slug: string
    name: string
    price: number
    product_images?: { url: string }[]
  }
}

export default function ProductCard({ product }: Props) {
  const img = product.product_images?.[0]?.url || '/placeholder.png'
  return (
    <Link href={`/products/${product.slug}`} className="block border rounded-md p-3 hover:shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={product.name} className="w-full h-48 object-cover rounded" />
      <div className="mt-3">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-amber-700 font-semibold">₱{product.price.toFixed(2)}</p>
      </div>
    </Link>
  )
}
