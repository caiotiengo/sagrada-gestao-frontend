'use client'

import { Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatDate } from '@/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { INVITE_STATUS_LABELS } from '@/constants'

interface PendingCardProps {
  title: string
  description: string
  date: string
  status: string
  onAction?: () => void
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  accepted: 'default',
  expired: 'destructive',
  revoked: 'secondary',
}

export function PendingCard({
  title,
  description,
  date,
  status,
  onAction,
}: PendingCardProps) {
  return (
    <Card
      className={cn(
        'rounded-xl shadow-sm transition-colors',
        onAction && 'cursor-pointer hover:bg-muted/40'
      )}
      onClick={onAction}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="truncate">{title}</CardTitle>
          <Badge variant={statusVariant[status] ?? 'outline'}>
            {INVITE_STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{formatDate(date)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
