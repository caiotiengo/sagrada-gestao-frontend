'use client'

import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface SummaryCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-600 dark:text-red-400',
  },
  neutral: {
    icon: null,
    color: 'text-muted-foreground',
  },
} as const

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: SummaryCardProps) {
  const trendInfo = trend ? trendConfig[trend] : null
  const TrendIcon = trendInfo?.icon ?? null

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[0.8125rem] text-muted-foreground">{title}</p>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <Icon className="size-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {TrendIcon && (
            <TrendIcon className={cn('size-4', trendInfo?.color)} />
          )}
        </div>
        {description && (
          <p className={cn('text-xs', trendInfo?.color ?? 'text-muted-foreground')}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
