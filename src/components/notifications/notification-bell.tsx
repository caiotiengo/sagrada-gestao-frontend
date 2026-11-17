'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Settings2 } from 'lucide-react'
import { ROUTES } from '@/constants'
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { NotificationItem } from '@/types'

function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => !item.isRead && onRead(item.id)}
      className={cn(
        'flex w-full gap-2.5 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted',
        !item.isRead && 'bg-primary/5',
      )}
      aria-label={item.isRead ? item.title : `${item.title} (não lida, marcar como lida)`}
      data-testid="notification-row"
    >
      <span
        className={cn('mt-1.5 size-2 shrink-0 rounded-full', item.isRead ? 'bg-transparent' : 'bg-primary')}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className={cn('block break-words text-[0.8125rem]', !item.isRead && 'font-semibold')}>
          {item.title}
        </span>
        <span className="mt-0.5 block whitespace-pre-line break-words text-xs text-muted-foreground">
          {item.body}
        </span>
        <span className="mt-1 block text-[0.6875rem] text-muted-foreground/70">
          {formatDateTime(item.createdAt)}
        </span>
      </span>
    </button>
  )
}

/** Sino com contador de não lidas e lista das notificações da casa atual. */
export function NotificationBell({ className }: { className?: string }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState(1)
  const { data: unread = 0 } = useUnreadNotificationsCount()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const badge = unread > 99 ? '99+' : String(unread)

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPages(1) }}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn('relative', className)}
            aria-label={unread > 0 ? `Notificações (${unread} não lidas)` : 'Notificações'}
            data-testid="notification-bell"
          />
        }
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-semibold leading-none text-white"
            data-testid="notification-count"
          >
            {badge}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] gap-1 p-2">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-sm font-semibold">Notificações</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            disabled={unread === 0 || markAll.isPending || !houseId}
            onClick={() => houseId && markAll.mutate({ houseId })}
          >
            <CheckCheck className="size-3.5" />
            Marcar todas como lidas
          </Button>
        </div>
        <Link
          href={ROUTES.NOTIFICATION_SETTINGS}
          onClick={() => setOpen(false)}
          className="flex items-center gap-1.5 px-2 pb-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="size-3.5" />
          Preferências de notificação
        </Link>
        <div className="max-h-[min(26rem,65dvh)] overflow-y-auto">
          {open && Array.from({ length: pages }, (_, i) => (
            <NotificationPage
              key={i}
              page={i + 1}
              isLast={i + 1 === pages}
              onRead={(id) => markRead.mutate({ notificationId: id })}
              onMore={() => setPages((p) => p + 1)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationPage({
  page,
  isLast,
  onRead,
  onMore,
}: {
  page: number
  isLast: boolean
  onRead: (id: string) => void
  onMore: () => void
}) {
  const { data, isLoading, isError } = useNotifications(page)
  const items = data?.data ?? []

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }
  if (isError) {
    return <p className="px-2 py-6 text-center text-xs text-muted-foreground">Não foi possível carregar as notificações.</p>
  }
  if (page === 1 && items.length === 0) {
    return <p className="px-2 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
  }
  return (
    <>
      {items.map((item) => <NotificationRow key={item.id} item={item} onRead={onRead} />)}
      {isLast && data?.pagination.hasNext && (
        <Button variant="ghost" size="sm" className="mt-1 w-full text-xs" onClick={onMore}>
          Carregar mais
        </Button>
      )}
    </>
  )
}
