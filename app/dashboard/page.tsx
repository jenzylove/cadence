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
const [expandedCaptions, setExpandedCaptions] = useState<Set<number>>(new Set())

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

function toggleCaption(postId: number) {
  setExpandedCaptions((prev) => {
    const next = new Set(prev)
    if (next.has(postId)) {
      next.delete(postId)
    } else {
      next.add(postId)
    }
    return next
  })
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

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 md:px-8 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
            Your queue
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            A week at a glance, for every product.
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
const progressPercent = productPosts.length > 0 ? (approvedCount / productPosts.length) * 100 : 0
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

                  {productPosts.length > 0 && (
                    <div className="px-5 pb-3">
                      <div className="h-[5px] bg-muted/30 rounded-full overflow-hidden">
                        <div
  className="h-full bg-sage rounded-full transition-all duration-300"
  style={{ width: `${progressPercent}%` }}
/>
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="px-5 pb-5">
                      {productPosts.length === 0 ? (
                        <div className="border border-dashed border-muted rounded-[14px] p-6 text-center">
                          <p className="text-muted-foreground font-sans text-sm">
                            No posts yet for {product.name}.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {productPosts.map((post) => {
                            const isEditing = editingId === post.id
                            const isApproved = post.status === 'approved'

                            return (
                              <div
                                key={post.id}
                                className={`rounded-[14px] border p-3 flex flex-col gap-2 ${
  isApproved ? 'border-sage bg-sage/10' : 'border-border bg-background'
}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                                    {post.platform}
                                  </span>
                                  {isApproved ? (
  <span className="text-xs font-sans text-sage flex items-center gap-1">
    <Check className="w-3 h-3" /> Approved
  </span>
) : (
                                    <span className="text-xs text-muted-foreground font-sans">
                                      {formatDate(post.scheduled_for)}
                                    </span>
                                  )}
                                </div>

                                {isEditing ? (
  <textarea
    value={editText}
    onChange={(e) => setEditText(e.target.value)}
    rows={5}
    className="text-sm font-sans text-foreground leading-relaxed rounded-[10px] border border-border bg-card p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
  />
) : (
  <div>
    <p className={`text-sm font-sans text-foreground leading-relaxed ${
      expandedCaptions.has(post.id) ? '' : 'line-clamp-3'
    }`}>
      {post.caption}
    </p>
    {post.caption.length > 120 && (
      <button
        onClick={() => toggleCaption(post.id)}
        className="text-xs font-sans text-secondary mt-1 hover:underline"
      >
        {expandedCaptions.has(post.id) ? 'Show less' : 'Read more'}
      </button>
    )}
  </div>
)}
{post.hashtags && !isEditing && (
  <p className="text-xs font-sans text-muted-foreground/70 -mt-1 truncate">
    {post.hashtags}
  </p>
)}

                                <div className="flex items-center gap-1.5 pt-2 border-t border-border mt-auto">
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => saveEdit(post.id)}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-1.5 rounded-[8px] hover:bg-primary/20 transition-colors text-foreground"
                                      >
                                        <Check className="w-3.5 h-3.5" /> Save
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-1.5 rounded-[8px] hover:bg-muted/40 transition-colors text-muted-foreground"
                                      >
                                        <X className="w-3.5 h-3.5" /> Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {isApproved ? (
                                        <button
  onClick={() => handleShare(post, product)}
  className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-1.5 rounded-[8px] bg-sage/20 hover:bg-sage/30 transition-colors text-sage"
>
  <Share2 className="w-3.5 h-3.5" /> Share
</button>
                                      ) : (
                                        <button
                                          onClick={() => handleApprove(post.id)}
                                          className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-1.5 rounded-[8px] hover:bg-primary/20 transition-colors text-foreground"
                                        >
                                          <Check className="w-3.5 h-3.5" /> Approve
                                        </button>
                                      )}
                                      <button
                                        onClick={() => startEdit(post)}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-1.5 rounded-[8px] hover:bg-muted/40 transition-colors text-muted-foreground"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleRedo(post.id)}
                                        disabled={redoingId === post.id}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-medium py-1.5 rounded-[8px] hover:bg-muted/40 transition-colors text-muted-foreground disabled:opacity-60"
                                      >
                                        <RotateCw className={`w-3.5 h-3.5 ${redoingId === post.id ? 'animate-spin' : ''}`} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
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