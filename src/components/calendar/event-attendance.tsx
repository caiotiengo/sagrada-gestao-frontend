'use client'

import { useState } from 'react'
import { Check, UserCheck, Users } from 'lucide-react'
import { useEventAttendees, useEventRsvp } from '@/hooks/use-calendar'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { EventItem } from '@/types'

/** Evento encerrado (fim, ou início quando não há fim) não aceita confirmação — mesma regra do back. */
export function isEventOver(event: Pick<EventItem, 'startDate' | 'endDate'>, now = Date.now()): boolean {
  const end = event.endDate || event.startDate
  return !!end && new Date(end).getTime() < now
}

export function RsvpButton({ event }: { event: EventItem }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const rsvp = useEventRsvp()
  const over = isEventOver(event)
  const attending = !!event.isAttending

  if (over) {
    return attending ? (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <Check className="size-3.5" /> Você confirmou presença
      </span>
    ) : null
  }

  return (
    <div className="flex items-center gap-2">
      {attending && (
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="size-3.5" /> Você vai
        </span>
      )}
      <Button
        size="sm"
        variant={attending ? 'outline' : 'default'}
        className="gap-1.5"
        disabled={rsvp.isPending || !houseId}
        onClick={() => houseId && rsvp.mutate({ houseId, eventId: event.id, confirm: !attending })}
        data-testid="rsvp-button"
      >
        {!attending && <UserCheck className="size-4" />}
        {rsvp.isPending ? 'Salvando...' : attending ? 'Cancelar presença' : 'Confirmar presença'}
      </Button>
    </div>
  )
}

export function AttendeesButton({ event }: { event: EventItem }) {
  const [open, setOpen] = useState(false)
  const count = event.attendeesCount ?? 0
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={() => setOpen(true)}
        aria-label={`Ver presenças confirmadas (${count})`}
        data-testid="attendees-button"
      >
        <Users className="size-3.5" />
        {count} confirmado{count === 1 ? '' : 's'}
      </Button>
      <AttendeesDialog event={event} open={open} onOpenChange={setOpen} />
    </>
  )
}

function AttendeesDialog({
  event,
  open,
  onOpenChange,
}: {
  event: EventItem
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { data, isLoading, isError, refetch } = useEventAttendees(open ? event.id : null)
  const attendees = [...(data?.data ?? [])].sort((a, b) =>
    (a.fullName ?? '').localeCompare(b.fullName ?? '', 'pt-BR'),
  )
  const total = data?.pagination.total ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Presenças confirmadas</DialogTitle>
          <DialogDescription>
            {event.title} · {formatDateTime(event.startDate)}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Não foi possível carregar a lista.{' '}
            <button type="button" className="text-primary underline" onClick={() => refetch()}>Tentar de novo</button>
          </div>
        ) : attendees.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Ninguém confirmou presença ainda.</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{total} pessoa{total === 1 ? '' : 's'}</p>
            <ul className="max-h-80 divide-y overflow-y-auto rounded-lg border" data-testid="attendees-list">
              {attendees.map((a) => (
                <li key={a.userId} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{a.fullName ?? 'Membro'}</span>
                  {a.confirmedAt && (
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.confirmedAt)}</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
