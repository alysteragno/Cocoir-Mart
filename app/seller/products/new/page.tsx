'use client'
import { useState, useRef } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const categories = [
  'Gardening',
  'Construction',
  'Home & Living',
  'Bulk Orders',
]

interface FormState {
  name: string
  description: string
  price: string
  stock: string
  category: string
  is_featured: boolean
}

interface FormErrors {
  name?: string
  price?: string
  stock?: string
  category?: string
  image?: string
}

export default function AddProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    is_featured: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be under 5MB' }))
      return
    }

    setErrors(prev => ({ ...prev, image: undefined }))
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price'
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = 'Enter a valid stock quantity'
    if (!form.category) e.category = 'Please select a category'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)

    try {
      const supabase = supabaseBrowser()
      let image_url: string | null = null

      // Upload image to Supabase Storage if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile, { upsert: false })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setGlobalError('Failed to upload image. Please try again.')
          setLoading(false)
          return
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        image_url = urlData.publicUrl
      }

      // Insert product
      const { error } = await supabase.from('products').insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        image_url,
        is_featured: form.is_featured,
      })

      if (error) {
        console.error('Insert error:', error)
        setGlobalError('Failed to add product. Please try again.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/seller/products'), 1500)

    } catch (err) {
      console.error(err)
      setGlobalError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-stone-800 text-sm bg-white placeholder:text-stone-400
    focus:outline-none focus:ring-2 transition-all duration-200
    ${err
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15'
      : 'border-stone-300 focus:border-amber-600 focus:ring-amber-600/15'
    }`

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/seller/products"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-stone-200 hover:bg-amber-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 mb-0.5">Products</p>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>
            Add New Product
          </h1>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-green-700">Product added! Redirecting…</p>
        </div>
      )}

      {/* Global error */}
      {globalError && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600">{globalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">

        {/* Basic Info */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 pb-2 border-b border-stone-100">
            Basic Information
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="e.g. Coir Grow Bag 10L"
              value={form.name} onChange={e => set('name', e.target.value)}
              className={inputCls(errors.name)} />
            {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
              Description
            </label>
            <textarea rows={4} placeholder="Describe the product — material, size, use case…"
              value={form.description} onChange={e => set('description', e.target.value)}
              className={`${inputCls()} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className={inputCls(errors.category)}>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="mt-1.5 text-xs text-red-500">{errors.category}</p>}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 pb-2 border-b border-stone-100">
            Pricing & Stock
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
                Price (₱) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">₱</span>
                <input type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.price} onChange={e => set('price', e.target.value)}
                  className={`${inputCls(errors.price)} pl-8`} />
              </div>
              {errors.price && <p className="mt-1.5 text-xs text-red-500">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2">
                Stock Quantity <span className="text-red-400">*</span>
              </label>
              <input type="number" min="0" placeholder="0"
                value={form.stock} onChange={e => set('stock', e.target.value)}
                className={inputCls(errors.stock)} />
              {errors.stock && <p className="mt-1.5 text-xs text-red-500">{errors.stock}</p>}
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[3px] text-amber-700 pb-2 border-b border-stone-100">
            Product Image
          </p>

          {/* Preview */}
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full border border-stone-200 shadow flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            /* Upload area */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3
                transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 group
                ${errors.image ? 'border-red-400 bg-red-50' : 'border-stone-300 bg-stone-50'}`}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm group-hover:border-amber-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-400 group-hover:text-amber-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-stone-600 group-hover:text-amber-700 transition-colors">
                  Click to upload image
                </p>
                <p className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </button>
          )}

          {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Featured toggle */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
          <div>
            <p className="text-sm font-semibold text-stone-700">Featured Product</p>
            <p className="text-xs text-stone-400 mt-0.5">Show this product on the homepage</p>
          </div>
          <button
            type="button"
            onClick={() => set('is_featured', !form.is_featured)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200
              ${form.is_featured ? 'bg-amber-600' : 'bg-stone-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
              ${form.is_featured ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-900
              text-amber-50 text-sm font-semibold rounded-xl transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
              shadow-lg shadow-stone-900/20 hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Adding Product…
              </span>
            ) : 'Add Product'}
          </button>
          <Link href="/seller/products"
            className="px-6 py-3.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}