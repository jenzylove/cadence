'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const isLanding = pathname === '/'
  const showLogout = !isLanding && pathname !== '/login' && pathname !== '/onboarding'

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-medium text-foreground">
          Cadence
        </Link>

        {isLanding ? (
          <Link
            href="/login"
            className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
        ) : (
          <nav aria-label="Primary" className="flex items-center gap-5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-sans transition-colors ${
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                Log out
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
