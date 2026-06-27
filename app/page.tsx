'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Page() {
  const [isHovered, setIsHovered] = useState(false)
  const captionSets = [
  [
    "New drop just landed — limited run, won't restock",
    "Three left in this color. After that, we're done.",
    "This one sold out twice already. Back in stock today.",
  ],
  [
    "Quick tip: here's how customers actually use this",
    "Most people don't know it does this too.",
    "Here's the trick our repeat customers all know.",
  ],
  [
    "Why we built this the way we did",
    "Every batch is small on purpose. Here's why.",
    "We tried five versions before this one felt right.",
  ],
]

const [captionIndex, setCaptionIndex] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    setCaptionIndex((prev) => (prev + 1) % 3)
  }, 4000)
  return () => clearInterval(interval)
}, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-start px-4 sm:px-6 md:px-8 pt-12 md:pt-16 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-start w-full">
          {/* Left: Text Content */}
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="space-y-3">
              <p className="text-sm font-sans font-semibold text-secondary uppercase tracking-wide">
                 Social content for small businesses
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight text-pretty">
                Add a product. Get a week of posts.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed">
                Stay visible without the daily effort. Built for small product brands.
              </p>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <Link
  href="/onboarding"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-[20px] bg-primary text-foreground font-sans font-semibold text-base sm:text-lg transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2"
>
  Start free
  <ArrowRight
    className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
    aria-hidden="true"
  />
</Link>
              <span className="text-sm sm:text-base text-muted-foreground font-sans">
                for small product brands
              </span>
            </div>
          </div>

          {/* Right: Post Queue Mockups */}
          <div className="relative flex items-start justify-start">
            <div className="relative w-full max-w-xs h-80">
              {/* Post Card 1 - Instagram */}
              <div className="absolute bg-card rounded-[18px] shadow-sm p-4 border border-border transform rotate-2 translate-x-0 translate-y-0 z-30 w-56 h-auto" style={{top: 0, left: 0}}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                      instagram
                    </span>
                  </div>
                  <p key={captionIndex} className="text-sm font-sans text-foreground transition-opacity duration-500 animate-in fade-in">
  {captionSets[0][captionIndex]}
</p>
                </div>
              </div>

              {/* Post Card 2 - X */}
              <div className="absolute bg-card rounded-[18px] shadow-sm p-4 border border-border transform -rotate-1 translate-x-16 translate-y-24 z-20 w-56 h-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                      x
                    </span>
                  </div>
                  <p key={captionIndex} className="text-sm font-sans text-foreground transition-opacity duration-500 animate-in fade-in">
  {captionSets[1][captionIndex]}
</p>
                </div>
              </div>

              {/* Post Card 3 - LinkedIn */}
              <div className="absolute bg-card rounded-[18px] shadow-sm p-4 border border-border transform rotate-1 translate-x-32 translate-y-48 z-10 w-56 h-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                      linkedin
                    </span>
                  </div>
                  <p key={captionIndex} className="text-sm font-sans text-foreground transition-opacity duration-500 animate-in fade-in">
  {captionSets[2][captionIndex]}
</p>
                </div>
              </div>

              {/* Post Card 4 - Queued (Dashed Border) */}
              <div className="absolute bg-card rounded-[18px] shadow-sm p-4 border-2 border-dashed border-muted translate-x-48 translate-y-64 z-0 w-56 h-auto flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-muted/30 text-muted-foreground">
                    <span className="text-xs font-semibold">queued</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">waiting its turn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
            {/* Stat 1 */}
            <div className="flex flex-col items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="font-display text-5xl md:text-6xl font-medium text-foreground">
                1
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-sans leading-relaxed">
                One product, added once
              </p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="font-display text-5xl md:text-6xl font-medium text-foreground">
                7
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-sans leading-relaxed">
                A week of posts, tuned per platform
              </p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="font-display text-5xl md:text-6xl font-medium text-muted">
                always
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-sans leading-relaxed">
                Lives in your queue, ready when you are
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border px-4 sm:px-6 md:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-muted-foreground font-sans">
              © 2026 Cadence. Built for small businesses.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-foreground hover:text-primary transition-colors font-sans">
                Privacy
              </a>
              <a href="#" className="text-sm text-foreground hover:text-primary transition-colors font-sans">
                Terms
              </a>
              <a href="#" className="text-sm text-foreground hover:text-primary transition-colors font-sans">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
