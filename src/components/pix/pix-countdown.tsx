'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface PixCountdownProps {
  /** When the PIX was created (timestamp) */
  startedAt: number
  /** Duration in seconds (default 600 = 10 min) */
  duration?: number
  /** Called when countdown reaches zero */
  onExpired: () => void
}

export function PixCountdown({ startedAt, duration = 600, onExpired }: PixCountdownProps) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000)
    return Math.max(0, duration - elapsed)
  })

  useEffect(() => {
    if (remaining <= 0) {
      onExpired()
      return
    }
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const left = Math.max(0, duration - elapsed)
      setRemaining(left)
      if (left <= 0) {
        clearInterval(timer)
        onExpired()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [startedAt, duration, remaining, onExpired])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isUrgent = remaining <= 120 // last 2 minutes
  const isExpired = remaining <= 0

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
        <AlertTriangle className="size-4 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">PIX expirado</p>
          <p className="text-xs text-muted-foreground">Sua contribuicao foi registrada para pagamento posterior.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
      isUrgent
        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
        : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
    }`}>
      <Clock className={`size-4 shrink-0 animate-pulse ${isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
      <div className="flex-1">
        <p className={isUrgent ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'}>
          Aguardando pagamento...
        </p>
        <p className={`text-xs ${isUrgent ? 'text-red-600 font-semibold' : 'text-amber-600'}`}>
          Expira em {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      </div>
      <span className={`font-mono text-lg font-bold tabular-nums ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
