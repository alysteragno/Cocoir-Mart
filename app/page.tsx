import Link from 'next/link'
import ProductGrid from '@/components/ProductGrid'

const stats = [
  { value: '100%', label: 'Natural Fiber' },
  { value: '50+',  label: 'Products' },
  { value: 'PH',   label: 'Nationwide Delivery' },
  { value: 'Eco',  label: 'Certified Sustainable' },
]

const categories = [
  { emoji: '🌱', label: 'Gardening',     desc: 'Coir pots, grow bags & mulch mats' },
  { emoji: '🏗️', label: 'Construction',  desc: 'Erosion control & geotextiles' },
  { emoji: '🛋️', label: 'Home & Living', desc: 'Doormats, rugs & brushes' },
  { emoji: '📦', label: 'Bulk Orders',   desc: 'Wholesale & custom sizing' },
]

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-3xl bg-stone-900 px-8 py-20 md:px-16 md:py-28">
        {/* Fiber texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(20deg,#c8a46e 0,#c8a46e 1px,transparent 1px,transparent 32px),' +
              'repeating-linear-gradient(110deg,#c8a46e 0,#c8a46e 1px,transparent 1px,transparent 48px)',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-700 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-green-800 rounded-full opacity-20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase text-amber-400">
              100% Natural · Made in the Philippines
            </span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold text-amber-50 leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            From Husk <br />
            <span className="text-amber-400">to Home.</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-stone-400 leading-relaxed max-w-lg">
            Sustainable coconut coir products handcrafted for construction,
            gardening, and everyday living — straight from the heart of the Philippines.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500
                text-white text-sm font-semibold rounded-xl transition-all duration-200
                shadow-lg shadow-amber-900/30 hover:-translate-y-0.5"
            >
              Browse Products
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15
                text-amber-50 text-sm font-semibold rounded-xl border border-white/10
                transition-all duration-200 hover:-translate-y-0.5"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Floating coconut */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 opacity-20 select-none pointer-events-none">
          <span className="text-[140px] leading-none">🥥</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ value, label }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 text-center
              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <p
              className="text-3xl font-bold text-stone-800"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {value}
            </p>
            <p className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </section>

      {/* ── CATEGORIES ── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 mb-1">Shop by Use</p>
            <h2
              className="text-2xl font-bold text-stone-800"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Find What You Need
            </h2>
          </div>
          <div className="flex-1 h-px bg-stone-100 hidden md:block" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(({ emoji, label, desc }) => (
            <Link
              key={label}
              href={`/products?category=${label.toLowerCase()}`}
              className="group bg-white rounded-2xl border border-stone-100 p-5
                hover:border-amber-200 hover:shadow-lg hover:shadow-amber-900/8
                hover:-translate-y-1 transition-all duration-200"
            >
              <span className="text-3xl mb-3 block">{emoji}</span>
              <p className="font-semibold text-stone-800 text-sm group-hover:text-amber-700 transition-colors">
                {label}
              </p>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 mb-1">Handpicked</p>
            <h2
              className="text-2xl font-bold text-stone-800"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-600 transition-colors"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <ProductGrid kind="featured" />
      </section>

      {/* ── WHY COIR BANNER ── */}
      <section className="rounded-3xl bg-amber-50 border border-amber-100 px-8 py-12 md:px-14 flex flex-col md:flex-row items-center gap-8">
        <div className="text-5xl shrink-0">🌿</div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 mb-2">Why Coconut Coir?</p>
          <h3
            className="text-xl font-bold text-stone-800 mb-2"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Nature&apos;s Most Versatile Fiber
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xl">
            Coconut coir is biodegradable, naturally resistant to rot and fungi, and an excellent
            growing medium. Every purchase supports Filipino farmers and reduces agricultural waste.
          </p>
        </div>
        <Link
          href="/products"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700
            text-amber-50 text-sm font-semibold rounded-xl transition-all duration-200
            shadow-md hover:-translate-y-0.5"
        >
          Shop Now
        </Link>
      </section>

    </div>
  )
} 