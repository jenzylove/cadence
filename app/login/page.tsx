'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !password) return
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'login', name, password }),
    })
    const json = await res.json()

    if (json.success) {
      router.push('/dashboard')
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
            Welcome back
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            Log in to pick your queue back up.
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

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium font-sans text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
                className="rounded-[14px] border border-border bg-background px-4 py-3 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && <p className="text-sm text-destructive font-sans">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-[16px] bg-primary text-foreground font-sans font-semibold text-base transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? 'Logging in...' : 'Log in'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <p className="text-sm text-muted-foreground font-sans text-center mt-6">
          Need an account?{' '}
          <Link href="/onboarding" className="text-secondary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
