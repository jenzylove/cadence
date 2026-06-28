'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'whatsapp', label: 'WhatsApp' },
]

const CATEGORIES = [
  { id: 'fashion', label: 'Fashion & accessories' },
  { id: 'food', label: 'Food & drink' },
  { id: 'beauty', label: 'Beauty & skincare' },
  { id: 'home', label: 'Home & crafts' },
  { id: 'services', label: 'Services' },
  { id: 'other', label: 'Other' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>(['instagram', 'x'])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('other')
  function togglePlatform(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (selected.length === 0) {
      setError('Pick at least one platform.')
      return
    }
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, platforms: selected }),
    })
    const json = await res.json()

    if (json.success) {
      router.push('/products')
    } else {
      setError(json.error || 'Something went wrong.')
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 md:px-8 py-12 md:py-16 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
            Set up your business
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            Tell us where you post. Cadence builds the queue around it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-[20px] border border-border shadow-sm p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="businessName" className="text-sm font-medium font-sans text-foreground">
                Business name
              </label>
              <input
                id="businessName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lantern & Wick Co."
                required
                className="rounded-[14px] border border-border bg-background px-4 py-3 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium font-sans text-foreground">
                What do you sell?
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary border-primary text-foreground'
                          : 'bg-background border-border text-muted-foreground hover:border-primary'
                      }`}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium font-sans text-foreground">
                Where do you post?
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const isSelected = selected.includes(platform.id)
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary border-primary text-foreground'
                          : 'bg-background border-border text-muted-foreground hover:border-primary'
                      }`}
                    >
                      {platform.label}
                    </button>
                  )
                })}
              </div>
              {error && <p className="text-sm text-destructive font-sans">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-[16px] bg-primary text-foreground font-sans font-semibold text-base transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? 'Setting up...' : 'Continue'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}