import Link from 'next/link'
import { APP_NAME, ROUTES } from '@/constants'

interface PublicLayoutProps {
  children: React.ReactNode
  houseName?: string
}

export function PublicLayout({ children, houseName }: PublicLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-13 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              {houseName ?? APP_NAME}
            </span>
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <p className="text-center text-xs text-muted-foreground/70">
            {APP_NAME} &mdash; Sistema de gest&atilde;o para casas de santo
          </p>
        </div>
      </footer>
    </div>
  )
}
