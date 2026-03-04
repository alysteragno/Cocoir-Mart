import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  image_url?: string | null
  badge?: string | null
  rating?: number | null
  review_count?: number | null
}

export default function ProductCard({ product }: { product: Product }) {
  const badge = product?.badge ?? null
  const rating = product?.rating ?? null
  const reviewCount = product?.review_count ?? null
  const price = product?.price ?? 0

  const badgeColor: Record<string, string> = {
    'New':         'bg-green-100 text-green-700 border-green-200',
    'Trending':    'bg-amber-100 text-amber-700 border-amber-200',
    'Best Seller': 'bg-stone-100 text-stone-700 border-stone-200',
  }

  return (
    <Link
      href={`/products/${product?.id ?? '#'}`}
      className="group relative bg-white rounded-2xl border border-stone-100 overflow-hidden
        hover:shadow-xl hover:shadow-stone-900/10 hover:-translate-y-1
        transition-all duration-300 flex flex-col"
    >
      {/* Image placeholder */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-amber-50 to-stone-100 overflow-hidden flex items-center justify-center">

        {/* Placeholder pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #c8a46e 0, #c8a46e 1px, transparent 1px, transparent 12px)',
          }}
        />

        {/* Placeholder icon */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-stone-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium tracking-wide">No Image</span>
        </div>

        {/* Badge */}
        {badge && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold
            border tracking-wide ${badgeColor[badge] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>
            {badge}
          </div>
        )}

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0
          transition-transform duration-300 bg-stone-900/90 backdrop-blur-sm py-3 px-4
          flex items-center justify-center">
          <span className="text-amber-50 text-xs font-semibold tracking-widest uppercase">
            Add to Cart
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-700">
          Cocoir-Mart
        </p>
        <h3
          className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {product?.name ?? 'Unnamed Product'}
        </h3>

        {/* Stars */}
        {rating != null && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <svg key={star} xmlns="http://www.w3.org/2000/svg"
                className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-stone-200'}`}
                fill="currentColor" viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
            {reviewCount != null && (
              <span className="text-[10px] text-stone-400 ml-0.5">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price + add button */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-base font-bold text-stone-800">
            ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center
            group-hover:bg-amber-600 group-hover:border-amber-600 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-amber-600 group-hover:text-white transition-colors duration-300"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}