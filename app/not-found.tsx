import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 md:px-8 py-12 md:py-16 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <p className="font-display text-6xl font-medium text-muted mb-4">404</p>
        <h1 className="font-display text-2xl sm:text-3xl font-medium leading-tight mb-3">
          This page doesn't exist
        </h1>
        <p className="text-muted-foreground font-sans mb-8">
          The link you followed might be broken, or the page may have moved.
        </p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-[20px] bg-primary text-foreground font-sans font-semibold text-base transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Back to home
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </main>
  )
}
