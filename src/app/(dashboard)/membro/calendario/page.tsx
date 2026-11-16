'use client'

import { useState } from 'react'
import { CalendarDays, MapPin, Clock, Repeat, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEvents } from '@/hooks/use-calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { formatDateTime } from '@/utils'
import {
  MONTH_NAMES,
  currentYearMonthBRT,
  formatDayLabel,
  monthEventRange,
  toCivilDateBRT,
} from '@/utils/dates'
import type { EventItem } from '@/types'


function groupByDay(events: EventItem[]) {
  const groups: Record<string, EventItem[]> = {}
  for (const event of events) {
    const day = toCivilDateBRT(event.startDate)
    if (!groups[day]) groups[day] = []
    groups[day].push(event)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

export default function MemberCalendarPage() {
  const now = currentYearMonthBRT()
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [page, setPage] = useState(1)

  const { startAfter, startBefore } = monthEventRange(year, month)
  const { data, isLoading, isError, refetch } = useEvents(page, startAfter, startBefore)

  const events = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )
  const grouped = groupByDay(sortedEvents)

  const goToPrevMonth = () => {
    setPage(1)
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    setPage(1)
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const goToToday = () => {
    setPage(1)
    setYear(now.year)
    setMonth(now.month)
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <h1 className="text-lg font-bold tracking-tight">Calendário</h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="size-5" />
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {MONTH_NAMES[month]} {year}
          </h2>
          {(year !== now.year || month !== now.month) && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Events List grouped by day */}
      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : grouped.length > 0 ? (
        <div className="space-y-6">
          {grouped.map(([day, dayEvents]) => (
            <div key={day}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {formatDayLabel(day)}
              </h3>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <Card key={event.id} className="rounded-xl shadow-sm">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-medium">{event.title}</h2>
                        {event.isRecurring && (
                          <Badge variant="secondary" className="shrink-0">
                            <Repeat className="mr-1 size-3" />
                            Recorrente
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 shrink-0" />
                          <span>
                            {formatDateTime(event.startDate)}
                            {event.endDate && ` — ${formatDateTime(event.endDate)}`}
                          </span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento neste mês"
          description={`Nenhum evento encontrado em ${MONTH_NAMES[month]} ${year}.`}
        />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}
