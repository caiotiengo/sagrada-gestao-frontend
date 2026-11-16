'use client'

import { Pin, CalendarClock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/utils'
import { cn } from '@/lib/utils'
import type { NoticeItem } from '@/types'

export function isNoticeExpired(notice: Pick<NoticeItem, 'expiresAt'>, now = Date.now()): boolean {
  return !!notice.expiresAt && new Date(notice.expiresAt).getTime() <= now
}

interface NoticeCardProps {
  notice: NoticeItem
  actions?: React.ReactNode
  /** Corta o corpo em 3 linhas (widgets). */
  compact?: boolean
}

export function NoticeCard({ notice, actions, compact = false }: NoticeCardProps) {
  const expired = isNoticeExpired(notice)
  return (
    <Card
      className={cn(
        'rounded-xl shadow-sm',
        notice.pinned && !expired && 'border-primary/40 bg-primary/5',
        expired && 'opacity-70',
      )}
      data-testid="notice-card"
    >
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {notice.pinned && (
                <Badge variant="default" className="gap-1">
                  <Pin className="size-3" />
                  Fixado
                </Badge>
              )}
              {expired && <Badge variant="outline">Vencido</Badge>}
              <h3 className="break-words font-medium">{notice.title}</h3>
            </div>
            <p
              className={cn(
                'mt-1.5 whitespace-pre-line break-words text-sm text-muted-foreground',
                compact && 'line-clamp-3',
              )}
            >
              {notice.body}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {notice.createdAt && <span>Publicado em {formatDateTime(notice.createdAt)}</span>}
              {notice.expiresAt && (
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3" />
                  {expired ? 'Venceu em' : 'Vale até'} {formatDate(notice.expiresAt)}
                </span>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
