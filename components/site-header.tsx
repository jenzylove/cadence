'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-medium text-foreground">
          Cadence
        </Link>

        {!isLanding && (
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
          </nav>
        )}
      </div>
    </header>
  )
}
