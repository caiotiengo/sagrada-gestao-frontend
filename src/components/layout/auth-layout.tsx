'use client'

import { APP_NAME } from '@/constants'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-8 sm:px-6">
      {/* Subtle background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/4 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo / App name */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </h1>
        </div>

        {/* Card */}
        <div
          className={cn(
            'w-full rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
