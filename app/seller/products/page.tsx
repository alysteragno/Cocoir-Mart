import Link from 'next/link'

export default function SellerProducts() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link href="/seller/products/new" className="px-3 py-1 bg-amber-600 text-white rounded">Add Product</Link>
      </div>
      <p>List products here with edit/delete actions.</p>
    </div>
  )
}
