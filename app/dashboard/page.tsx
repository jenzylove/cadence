'use client'

import { useEffect, useState } from 'react'
import { Check, RotateCw, Pencil, Sparkles, X, Share2, ChevronDown } from 'lucide-react'

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
  const [redoingId, setRedoingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<Record<number, number>>({})

  async function loadAll() {
    const [productsRes, postsRes] = await Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/posts').then((r) => r.json()),
    ])
    if (productsRes.success) {
      setProducts(productsRes.data)
      if (expandedId === null && productsRes.data.length > 0) {
        setExpandedId(productsRes.data[0].id)
      }
    }
    if (postsRes.success) setPosts(postsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGenerate(productId: number) {
    setGeneratingFor(productId)
    await fetch(`/api/products/${productId}/generate`, { method: 'POST' })
    await loadAll()
    setActiveIndex((prev) => ({ ...prev, [productId]: 0 }))
    setGeneratingFor(null)
  }

  async function handleApprove(postId: number) {
    await fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
    await loadAll()
  }

  async function handleRedo(postId: number) {
    setRedoingId(postId)
    await fetch(`/api/posts/${postId}/regenerate`, { method: 'POST' })
    await loadAll()
    setRedoingId(null)
  }

  function startEdit(post: Post) {
    setEditingId(post.id)
    setEditText(post.caption)
  }

  async function saveEdit(postId: number) {
    await fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: editText }),
    })
    setEditingId(null)
    await loadAll()
  }

  async function handleShare(post: Post, product: Product) {
    const photos = JSON.parse(product.photo_urls || '[]')
    const text = `${post.caption}\n\n${post.hashtags || ''}`

    if (navigator.share) {
      try {
        if (photos[0] && navigator.canShare) {
          const response = await fetch(photos[0])
          const blob = await response.blob()
          const file = new File([blob], 'product.jpg', { type: blob.type })

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ text, files: [file] })
            return
          }
        }
        await navigator.share({ text })
      } catch {
        // user cancelled, do nothing
      }
    } else {
      await navigator.clipboard.writeText(text)
      alert("Caption copied to clipboard (share isn't supported in this browser).")
    }
  }

  function advanceCard(productId: number, total: number) {
    setActiveIndex((prev) => {
      const current = prev[productId] ?? 0
      const next = (current + 1) % total
      return { ...prev, [productId]: next }
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 md:px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
            Your queue
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            One product at a time, one post at a time.
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
          <div className="flex flex-col gap-3">
            {products.map((product) => {
              const productPosts = posts
                .filter((p) => p.product_id === product.id)
                .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
              const photos = JSON.parse(product.photo_urls || '[]')
              const isExpanded = expandedId === product.id
              const approvedCount = productPosts.filter((p) => p.status === 'approved').length
              const currentIndex = activeIndex[product.id] ?? 0
              const currentPost = productPosts[currentIndex]
              const isEditing = editingId === currentPost?.id
              const isApproved = currentPost?.status === 'approved'

              return (
                <div key={product.id} className="bg-card rounded-[18px] border border-border overflow-hidden">
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : product.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {photos[0] ? (
                        <img src={photos[0]} alt={product.name} className="w-9 h-9 rounded-[10px] object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-[10px] bg-muted/30 flex-shrink-0" />
                      )}
                      <h2 className="font-display text-lg font-medium text-foreground truncate">
                        {product.name}
                      </h2>
                      <span className="text-xs font-sans px-2 py-1 rounded-full bg-secondary/20 text-secondary flex-shrink-0">
                        {productPosts.length > 0 ? `${approvedCount} of ${productPosts.length} approved` : 'No posts yet'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGenerate(product.id)
                        }}
                        disabled={generatingFor === product.id}
                        className="text-sm font-sans font-medium px-3 py-1.5 rounded-[10px] text-secondary hover:bg-secondary/10 flex items-center gap-1.5 transition-colors disabled:opacity-60"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {generatingFor === product.id
                            ? 'Generating...'
                            : productPosts.length > 0
                            ? 'Regenerate week'
                            : 'Generate week'}
                        </span>
                      </button>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-6">
                      {productPosts.length === 0 ? (
                        <div className="border border-dashed border-muted rounded-[14px] p-6 text-center">
                          <p className="text-muted-foreground font-sans text-sm">
                            No posts yet for {product.name}.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-1 mb-4">
                            {productPosts.map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-[3px] rounded-full ${
                                  i === currentIndex ? 'bg-secondary' : 'bg-border'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="relative pb-3">
                            <div className="absolute top-3 left-2 right-2 bottom-0 bg-border rounded-[20px] h-[90%]" />
                            <div className="absolute top-1.5 left-1 right-1 bottom-0 bg-muted/30 rounded-[20px] h-[95%]" />

                            <div
                              onClick={() => !isEditing && advanceCard(product.id, productPosts.length)}
                              className="relative bg-background border border-border rounded-[20px] p-6 shadow-sm cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/20 text-secondary">
                                  {currentPost.platform}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isApproved && (
                                    <span className="text-xs font-sans text-sage flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Approved
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground font-sans">
                                    Day {currentIndex + 1}
                                  </span>
                                </div>
                              </div>

                              {isEditing ? (
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  rows={5}
                                  className="text-base font-sans text-foreground leading-relaxed rounded-[10px] border border-border bg-card p-3 w-full resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              ) : (
                                <p className="text-base font-sans text-foreground leading-relaxed mb-3">
                                  {currentPost.caption}
                                </p>
                              )}

                              {currentPost.hashtags && !isEditing && (
                                <p className="text-xs font-sans text-muted-foreground/70">
                                  {currentPost.hashtags}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    saveEdit(currentPost.id)
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-sans font-medium py-3 rounded-[14px] bg-primary text-foreground"
                                >
                                  <Check className="w-4 h-4" /> Save
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingId(null)
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-sans font-medium py-3 rounded-[14px] border border-border text-muted-foreground"
                                >
                                  <X className="w-4 h-4" /> Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                {isApproved ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleShare(currentPost, product)
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-sans font-medium py-3 rounded-[14px] bg-sage text-card"
                                  >
                                    <Share2 className="w-4 h-4" /> Share
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleApprove(currentPost.id)
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-sans font-medium py-3 rounded-[14px] bg-primary text-foreground"
                                  >
                                    <Check className="w-4 h-4" /> Approve
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    startEdit(currentPost)
                                  }}
                                  className="px-4 py-3 rounded-[14px] border border-border text-muted-foreground"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRedo(currentPost.id)
                                  }}
                                  disabled={redoingId === currentPost.id}
                                  className="px-4 py-3 rounded-[14px] border border-border text-muted-foreground disabled:opacity-60"
                                >
                                  <RotateCw className={`w-4 h-4 ${redoingId === currentPost.id ? 'animate-spin' : ''}`} />
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
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