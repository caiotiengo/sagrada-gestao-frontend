'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { noticesService } from '@/services/notices'
import type {
  CreateNoticeRequest,
  UpdateNoticeRequest,
  DeleteNoticeRequest,
  GetCommunityFeedRequest,
} from '@/types'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'

/** Avisos ativos (fixados primeiro). `includeExpired` mostra também os vencidos (gestão). */
export function useNotices(page = 1, includeExpired = false, limit = 20) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['notices', houseId, page, includeExpired, limit],
    queryFn: () =>
      noticesService.listNotices({ houseId: houseId!, page, limit, includeExpired }),
    enabled: !!houseId,
  })
}

export function useCommunityFeed(filter: GetCommunityFeedRequest['filter'] = 'all', limit = 10) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['community-feed', houseId, filter, limit],
    queryFn: () => noticesService.getCommunityFeed({ houseId: houseId!, filter, limit }),
    enabled: !!houseId,
  })
}

function invalidateNotices(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['notices'] })
  queryClient.invalidateQueries({ queryKey: ['community-feed'] })
}

export function useCreateNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNoticeRequest) => noticesService.createNotice(data),
    onSuccess: () => {
      invalidateNotices(queryClient)
      toast.success('Aviso publicado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao publicar aviso'))
    },
  })
}

export function useUpdateNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNoticeRequest) => noticesService.updateNotice(data),
    onSuccess: () => {
      invalidateNotices(queryClient)
      toast.success('Aviso atualizado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar aviso'))
    },
  })
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteNoticeRequest) => noticesService.deleteNotice(data),
    onSuccess: () => {
      invalidateNotices(queryClient)
      toast.success('Aviso removido')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao remover aviso'))
    },
  })
}
