'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { calendarService } from '@/services/calendar'
import type {
  CreateEventRequest,
  UpdateEventRequest,
  DeleteEventRequest,
} from '@/types'
import { toast } from 'sonner'

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
    onError: () => {
      toast.error('Erro ao criar evento')
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
    onError: () => {
      toast.error('Erro ao atualizar evento')
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
    onError: () => {
      toast.error('Erro ao remover evento')
    },
  })
}
