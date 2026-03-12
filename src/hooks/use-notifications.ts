'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { notificationsService } from '@/services/notifications'
import type {
  SendNotificationRequest,
  MarkNotificationReadRequest,
  MarkAllNotificationsReadRequest,
} from '@/types'
import { toast } from 'sonner'

export function useNotifications(page = 1, isRead?: boolean) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['notifications', houseId, page, isRead],
    queryFn: () =>
      notificationsService.listNotifications({
        houseId: houseId!,
        page,
        limit: 20,
        isRead,
      }),
    enabled: !!houseId,
  })
}

export function useSendNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendNotificationRequest) =>
      notificationsService.sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notificação enviada')
    },
    onError: () => {
      toast.error('Erro ao enviar notificação')
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkNotificationReadRequest) =>
      notificationsService.markNotificationRead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      toast.error('Erro ao marcar notificação como lida')
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkAllNotificationsReadRequest) =>
      notificationsService.markAllNotificationsRead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Todas as notificações marcadas como lidas')
    },
    onError: () => {
      toast.error('Erro ao marcar notificações como lidas')
    },
  })
}
