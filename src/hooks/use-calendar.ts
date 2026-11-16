'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { calendarService } from '@/services/calendar'
import type {
  CreateEventRequest,
  UpdateEventRequest,
  DeleteEventRequest,
  RsvpEventRequest,
} from '@/types'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'

export function useEvents(page = 1, startAfter?: string, startBefore?: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['events', houseId, page, startAfter, startBefore],
    queryFn: () =>
      calendarService.listEvents({
        houseId: houseId!,
        page,
        limit: 20,
        startAfter,
        startBefore,
      }),
    enabled: !!houseId,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventRequest) =>
      calendarService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento criado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar evento'))
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateEventRequest) =>
      calendarService.updateEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento atualizado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar evento'))
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteEventRequest) =>
      calendarService.deleteEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento removido')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao remover evento'))
    },
  })
}

/** Confirma (confirm=true) ou cancela a presença do usuário logado. */
export function useEventRsvp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ confirm, ...data }: RsvpEventRequest & { confirm: boolean }) =>
      confirm ? calendarService.confirmAttendance(data) : calendarService.cancelAttendance(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event-attendees', variables.houseId, variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['community-feed'] })
      toast.success(res.confirmed ? 'Presença confirmada' : 'Presença cancelada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar presença'))
    },
  })
}

export function useEventAttendees(eventId: string | null) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['event-attendees', houseId, eventId],
    queryFn: () =>
      calendarService.listEventAttendees({ houseId: houseId!, eventId: eventId!, page: 1, limit: 200 }),
    enabled: !!houseId && !!eventId,
  })
}
