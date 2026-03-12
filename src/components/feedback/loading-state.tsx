'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  inline?: boolean
  className?: string
}

export function LoadingState({
  message,
  inline = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        inline ? 'py-12' : 'min-h-[60dvh]',
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}
