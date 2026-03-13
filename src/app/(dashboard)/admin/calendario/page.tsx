'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  CalendarDays,
  MapPin,
  Repeat,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Pencil,
  Globe,
  Lock,
} from 'lucide-react'
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/use-calendar'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils'
import type { EventItem } from '@/types'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DateTimeInput } from '@/components/forms/datetime-input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function getMonthRange(year: number, month: number) {
  const startAfter = new Date(year, month, 1).toISOString()
  const startBefore = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
  return { startAfter, startBefore }
}

function groupByDay(events: EventItem[]) {
  const groups: Record<string, EventItem[]> = {}
  for (const event of events) {
    const day = event.startDate.slice(0, 10)
    if (!groups[day]) groups[day] = []
    groups[day].push(event)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

function formatDayLabel(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.getDate()
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  return `${day} - ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`
}

interface CreateEventForm {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  isRecurring: boolean
  isPublic: boolean
}

const initialForm: CreateEventForm = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  isRecurring: false,
  isPublic: false,
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CreateEventForm>(initialForm)

  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCalendar'))

  const { startAfter, startBefore } = getMonthRange(year, month)
  const { data, isLoading, isError, refetch } = useEvents(page, startAfter, startBefore)
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [editForm, setEditForm] = useState<CreateEventForm>(initialForm)

  const events = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  const [eventSearch, setEventSearch] = useState('')

  const filteredEvents = useMemo(() => {
    if (!eventSearch.trim()) return events
    const query = eventSearch.toLowerCase()
    return events.filter((e) =>
      e.title.toLowerCase().includes(query) ||
      (e.description && e.description.toLowerCase().includes(query)),
    )
  }, [events, eventSearch])

  const sortedEvents = [...filteredEvents].sort(
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
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  const handleCreateEvent = () => {
    if (!houseId || !form.title.trim() || !form.startDate) return
    createEvent.mutate(
      {
        houseId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        location: form.location.trim() || undefined,
        isRecurring: form.isRecurring,
        isPublic: form.isPublic,
      },
      {
        onSuccess: () => {
          setDialogOpen(false)
          setForm(initialForm)
        },
      },
    )
  }

  const openEditDialog = (event: EventItem) => {
    setEditingEvent(event)
    setEditForm({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate || '',
      location: event.location || '',
      isRecurring: event.isRecurring,
      isPublic: event.isPublic ?? false,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateEvent = () => {
    if (!houseId || !editingEvent || !editForm.title.trim() || !editForm.startDate) return
    updateEvent.mutate(
      {
        houseId,
        eventId: editingEvent.id,
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        startDate: editForm.startDate,
        endDate: editForm.endDate || undefined,
        location: editForm.location.trim() || undefined,
        isRecurring: editForm.isRecurring,
        isPublic: editForm.isPublic,
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setEditingEvent(null)
          setEditForm(initialForm)
        },
      },
    )
  }

  const handleTogglePublic = (event: EventItem) => {
    if (!houseId) return
    updateEvent.mutate({
      houseId,
      eventId: event.id,
      isPublic: !(event.isPublic ?? false),
    })
  }

  const handleDeleteEvent = (event: EventItem) => {
    if (!houseId) return
    deleteEvent.mutate({ houseId, eventId: event.id })
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar eventos"
        message="Não foi possível carregar a lista de eventos. Tente novamente."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Calendario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os eventos da casa
          </p>
        </div>

        {canManage && <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button size="sm" className="shrink-0 gap-2" />}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo Evento</span>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Preencha as informações do evento.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  placeholder="Nome do evento"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descrição do evento"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Inicio *</label>
                  <DateTimeInput
                    value={form.startDate}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, startDate: v }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Fim</label>
                  <DateTimeInput
                    value={form.endDate}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, endDate: v }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Local</label>
                <Input
                  placeholder="Local do evento"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="isRecurring"
                    type="checkbox"
                    checked={form.isRecurring}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isRecurring: e.target.checked }))
                    }
                    className="size-4 rounded border-input"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium">
                    Recorrente
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isPublic: e.target.checked }))
                    }
                    className="size-4 rounded border-input"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Exibir no site
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button
                onClick={handleCreateEvent}
                disabled={
                  createEvent.isPending ||
                  !form.title.trim() ||
                  !form.startDate
                }
              >
                {createEvent.isPending ? 'Criando...' : 'Criar Evento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="size-5" />
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {MONTH_NAMES[month]} {year}
          </h2>
          {(year !== now.getFullYear() || month !== now.getMonth()) && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar evento..."
          value={eventSearch}
          onChange={(e) => setEventSearch(e.target.value)}
          className="pl-9"
        />
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
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{event.title}</span>
                            {event.isRecurring && (
                              <Badge variant="secondary" className="gap-1">
                                <Repeat className="size-3" />
                                Recorrente
                              </Badge>
                            )}
                            {event.isPublic ? (
                              <Badge variant="default" className="gap-1">
                                <Globe className="size-3" />
                                Público
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <Lock className="size-3" />
                                Privado
                              </Badge>
                            )}
                          </div>

                          {event.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="size-3" />
                              {formatDate(event.startDate)}
                              {event.endDate && ` - ${formatDate(event.endDate)}`}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex shrink-0 gap-1">
                            {/* Editar */}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Editar evento"
                              onClick={() => openEditDialog(event)}
                            >
                              <Pencil className="size-4" />
                            </Button>

                            {/* Toggle Público/Privado */}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={event.isPublic ? 'Tornar privado' : 'Tornar público'}
                              onClick={() => handleTogglePublic(event)}
                              disabled={updateEvent.isPending}
                              className={event.isPublic ? 'text-primary hover:text-primary' : 'text-muted-foreground'}
                            >
                              {event.isPublic ? <Globe className="size-4" /> : <Lock className="size-4" />}
                            </Button>

                            {/* Remover */}
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Remover evento"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  />
                                }
                              >
                                <Trash2 className="size-4" />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remover evento?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover o evento &quot;{event.title}&quot;? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteEvent(event)}
                                    disabled={deleteEvent.isPending}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deleteEvent.isPending
                                      ? 'Removendo...'
                                      : 'Remover'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
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
          title="Nenhum evento neste mes"
          description={`Nenhum evento encontrado em ${MONTH_NAMES[month]} ${year}.`}
          action={{
            label: 'Criar Evento',
            onClick: () => setDialogOpen(true),
          }}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Altere as informações do evento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Nome do evento"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Descrição do evento"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Início *</label>
                <DateTimeInput
                  value={editForm.startDate}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, startDate: v }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Fim</label>
                <DateTimeInput
                  value={editForm.endDate}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, endDate: v }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Local</label>
              <Input
                placeholder="Local do evento"
                value={editForm.location}
                onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  id="editIsRecurring"
                  type="checkbox"
                  checked={editForm.isRecurring}
                  onChange={(e) => setEditForm((f) => ({ ...f, isRecurring: e.target.checked }))}
                  className="size-4 rounded border-input"
                />
                <label htmlFor="editIsRecurring" className="text-sm font-medium">
                  Recorrente
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="editIsPublic"
                  type="checkbox"
                  checked={editForm.isPublic}
                  onChange={(e) => setEditForm((f) => ({ ...f, isPublic: e.target.checked }))}
                  className="size-4 rounded border-input"
                />
                <label htmlFor="editIsPublic" className="text-sm font-medium">
                  Exibir no site
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button
              onClick={handleUpdateEvent}
              disabled={updateEvent.isPending || !editForm.title.trim() || !editForm.startDate}
            >
              {updateEvent.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
