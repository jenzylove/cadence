'use client'

import { useEffect, useState } from 'react'
import { Check, RotateCw, Pencil, Sparkles } from 'lucide-react'

type Post = {
  id: number
  product_id: number
  platform: string
  angle: string
  caption: string
  hashtags: string
  scheduled_for: string
  status: string
}

type Product = {
  id: number
  name: string
  photo_urls: string
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingFor, setGeneratingFor] = useState<number | null>(null)

  async function loadAll() {
    const [productsRes, postsRes] = await Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/posts').then((r) => r.json()),
    ])
    if (productsRes.success) setProducts(productsRes.data)
    if (postsRes.success) setPosts(postsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleGenerate(productId: number) {
    setGeneratingFor(productId)
    await fetch(`/api/products/${productId}/generate`, { method: 'POST' })
    await loadAll()
    setGeneratingFor(null)
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 md:px-8 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
            Your queue
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            Everything generated, sorted by product.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground font-sans text-sm">Loading...</p>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-muted rounded-[18px] p-8 text-center">
            <p className="text-muted-foreground font-sans text-sm">
              Add a product first, then come back to build its queue.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {products.map((product) => {
              const productPosts = posts.filter((p) => p.product_id === product.id)
              const photos = JSON.parse(product.photo_urls || '[]')

              return (
                <div key={product.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {photos[0] && (
                        <img src={photos[0]} alt={product.name} className="w-10 h-10 rounded-[10px] object-cover" />
                      )}
                      <h2 className="font-display text-xl font-medium text-foreground">
                        {product.name}
                      </h2>
                      <span className="text-xs font-sans px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                        {productPosts.length} {productPosts.length === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleGenerate(product.id)}
                      disabled={generatingFor === product.id}
                      className="text-sm font-sans font-medium px-4 py-2 rounded-[12px] bg-primary text-foreground flex items-center gap-2 hover:shadow-md transition-all disabled:opacity-60"
                    >
                      <Sparkles className="w-4 h-4" />
                      {generatingFor === product.id
                        ? 'Generating...'
                        : productPosts.length > 0
                        ? 'Regenerate week'
                        : 'Generate week'}
                    </button>
                  </div>

                  {productPosts.length === 0 ? (
                    <div className="border border-dashed border-muted rounded-[18px] p-6 text-center">
                      <p className="text-muted-foreground font-sans text-sm">
                        No posts yet for {product.name}.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                      {productPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-card rounded-[18px] border border-border shadow-sm p-4 flex-shrink-0 w-72 flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                              {post.platform}
                            </span>
                            <span className="text-xs text-muted-foreground font-sans">
                              {formatDate(post.scheduled_for)}
                            </span>
                          </div>

                          <p className="text-sm font-sans text-foreground leading-relaxed flex-1">
                            {post.caption}
                          </p>

                          {post.hashtags && (
                            <p className="text-xs font-sans text-muted-foreground">
                              {post.hashtags}
                            </p>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <button className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-2 rounded-[10px] hover:bg-primary/20 transition-colors text-foreground">
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-2 rounded-[10px] hover:bg-muted/40 transition-colors text-muted-foreground">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-2 rounded-[10px] hover:bg-muted/40 transition-colors text-muted-foreground">
                              <RotateCw className="w-3.5 h-3.5" /> Redo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}