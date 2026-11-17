'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { notificationsService, type NotificationPreferences } from '@/services/notifications'
import type {
  SendNotificationRequest,
  MarkNotificationReadRequest,
  MarkAllNotificationsReadRequest,
} from '@/types'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'

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

/** Contador de não lidas (só o total da 1ª página com isRead=false). Atualiza a cada minuto. */
export function useUnreadNotificationsCount() {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['notifications', houseId, 'unread-count'],
    queryFn: () =>
      notificationsService.listNotifications({ houseId: houseId!, page: 1, limit: 1, isRead: false }),
    select: (data) => data.pagination.total,
    enabled: !!houseId,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useSendNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendNotificationRequest) =>
      notificationsService.sendNotification(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(`Notificação enviada para ${res.sent} membro${res.sent === 1 ? '' : 's'}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao enviar notificação'))
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
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao marcar notificação como lida'))
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkAllNotificationsReadRequest) =>
      notificationsService.markAllNotificationsRead(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(res.marked === 0 ? 'Nada para marcar' : 'Todas as notificações marcadas como lidas')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao marcar notificações como lidas'))
    },
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => (await notificationsService.getNotificationPreferences()).preferences,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  const key = ['notifications', 'preferences']

  return useMutation({
    mutationFn: async (changes: Partial<NotificationPreferences>) =>
      (await notificationsService.updateNotificationPreferences(changes)).preferences,
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<NotificationPreferences>(key)
      if (prev) queryClient.setQueryData(key, { ...prev, ...changes })
      return { prev }
    },
    onError: (error, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
      toast.error(getErrorMessage(error, 'Erro ao salvar preferência'))
    },
    onSuccess: (prefs) => queryClient.setQueryData(key, prefs),
  })
}
