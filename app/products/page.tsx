'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Check, Upload } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

type Product = {
  id: number
  name: string
  details: string | null
  photo_urls: string
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [showQueueLink, setShowQueueLink] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  async function loadProducts() {
  const res = await fetch('/api/products')
  const json = await res.json()
  if (json.success) {
    setProducts(json.data)
  }
  setLoading(false)
}

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    const json = await res.json()

    if (json.success) {
      setPhotoUrl(json.url)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setFormError('')
    setSubmitting(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        details,
        photoUrls: photoUrl ? [photoUrl] : [],
      }),
    })
    const json = await res.json()

    if (json.success) {
  setName('')
  setDetails('')
  setPhotoUrl('')
  setJustAdded(true)
  setShowQueueLink(true)
  await loadProducts()
  setTimeout(() => setJustAdded(false), 1800)
} else if (json.error === 'unauthenticated') {
  setFormError('Please complete onboarding first.')
}
    setSubmitting(false)
  }
async function handleDelete(id: number) {
    setConfirmDeleteId(null)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    await loadProducts()
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 md:px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
            Add a product
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            One entry is enough to start the queue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-[20px] border border-border shadow-sm p-6 sm:p-8 mb-12">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium font-sans text-foreground">
                Product name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lavender soy candle"
                required
                className="rounded-[14px] border border-border bg-background px-4 py-3 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="details" className="text-sm font-medium font-sans text-foreground">
                Details <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Hand-poured, lavender and cedarwood, 40-hour burn"
                rows={3}
                className="rounded-[14px] border border-border bg-background px-4 py-3 font-sans text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="photo" className="text-sm font-medium font-sans text-foreground">
                Photo <span className="text-muted-foreground">(optional)</span>
              </label>
              <label
                htmlFor="photo"
                className="rounded-[14px] border border-dashed border-border bg-background px-4 py-6 font-sans text-sm text-muted-foreground flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
              >
                {uploading ? (
                  'Uploading...'
                ) : photoUrl ? (
                  <img src={photoUrl} alt="Product preview" className="h-20 rounded-[10px] object-cover" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Click to upload a photo
                  </>
                )}
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="self-start px-6 py-3 rounded-[16px] bg-primary text-foreground font-sans font-semibold text-base transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-60"
            >
              {justAdded ? (
                <>
                  Added <Check className="w-4 h-4" />
                </>
              ) : submitting ? (
                'Adding...'
              ) : (
                <>
                  Add product <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {formError && <p className="text-sm text-destructive font-sans">{formError}</p>}
          </div>
        </form>

        <div>
          <h2 className="font-display text-xl font-medium mb-4 text-foreground">
            Your products
          </h2>

          {showQueueLink && (
            <div className="bg-sage/10 border border-sage rounded-[16px] p-4 mb-8 flex items-center justify-between">
              <p className="text-sm font-sans text-foreground">
                Product added. Ready to build its queue?
              </p>
              <Link
                href="/dashboard"
                className="text-sm font-sans font-medium px-4 py-2 rounded-[12px] bg-sage text-card hover:shadow-md transition-all flex-shrink-0"
              >
                View queue →
              </Link>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-[18px] border border-border p-4 flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-[12px] flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-dashed border-muted rounded-[18px] p-8 text-center">
              <p className="text-muted-foreground font-sans text-sm">
                Add your first product to start the queue.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => {
                const photos = JSON.parse(product.photo_urls || '[]')
                return (
                  <div
                    key={product.id}
                    className="bg-card rounded-[18px] border border-border p-4 flex items-center gap-4"
                  >
                    {photos[0] && (
                      <img src={photos[0]} alt={product.name} className="w-14 h-14 rounded-[12px] object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-sans font-medium text-foreground">{product.name}</p>
                      {product.details && (
                        <p className="font-sans text-sm text-muted-foreground mt-1">
                          {product.details}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
  <span className="text-xs font-sans px-3 py-1 rounded-full bg-secondary/20 text-secondary whitespace-nowrap">
    queued
  </span>
  {confirmDeleteId === product.id ? (
    <>
      <button
        onClick={() => handleDelete(product.id)}
        className="text-xs font-sans font-medium text-destructive hover:underline px-2 py-1"
      >
        Confirm
      </button>
      <button
        onClick={() => setConfirmDeleteId(null)}
        className="text-xs font-sans text-muted-foreground hover:text-foreground px-2 py-1"
      >
        Cancel
      </button>
    </>
  ) : (
    <button
      onClick={() => setConfirmDeleteId(product.id)}
      className="text-xs font-sans text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
    >
      Remove
    </button>
  )}
</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}