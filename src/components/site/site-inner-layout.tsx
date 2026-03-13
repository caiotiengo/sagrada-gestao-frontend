'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useSiteContext } from '@/components/site/site-provider'
import { Button } from '@/components/ui/button'

interface SiteInnerLayoutProps {
  children: React.ReactNode
  title?: string
}

export function SiteInnerLayout({ children, title }: SiteInnerLayoutProps) {
  const { house } = useSiteContext()
  const config = house.siteConfig
  const primaryColor = config?.primaryColor || '#6366f1'

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ '--site-primary': primaryColor } as React.CSSProperties}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              {config?.logoUrl && config.logoUrl.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.logoUrl}
                  alt={house.displayName}
                  className="h-7 w-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <span className="text-sm font-semibold">{house.displayName}</span>
              )}
            </Button>
          </Link>
          {title && (
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {house.displayName}
      </footer>
    </div>
  )
}
