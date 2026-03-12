import type { PublicHouse } from '@/types'
import { cn } from '@/lib/utils'

interface PublicHouseHeaderProps {
  house: PublicHouse
  className?: string
}

export function PublicHouseHeader({ house, className }: PublicHouseHeaderProps) {
  return (
    <header className={cn('relative overflow-hidden', className)}>
      {/* Cover background */}
      {house.photoUrl ? (
        <div className="absolute inset-0">
          <img
            src={house.photoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/4 to-background" />
      )}

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
          {/* House Logo */}
          {house.photoUrl ? (
            <img
              src={house.photoUrl}
              alt={house.displayName}
              className="h-16 w-16 shrink-0 rounded-2xl border border-border/50 bg-card object-cover shadow-lg sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-card shadow-lg sm:h-20 sm:w-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-primary sm:h-8 sm:w-8"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}

          {/* House Info */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {house.displayName}
            </h1>
            {house.description && (
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                {house.description}
              </p>
            )}
            {house.address && (
              <p className="text-xs text-muted-foreground/70">
                {house.address}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
