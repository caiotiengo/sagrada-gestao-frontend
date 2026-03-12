'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { checkinsService } from '@/services/checkins'
import type {
  RegisterCheckinRequest,
  RegisterBulkCheckinRequest,
  CheckinType,
} from '@/types'
import { toast } from 'sonner'

export function useCheckins(page = 1, memberId?: string, type?: CheckinType, startDate?: string, endDate?: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['checkins', houseId, page, memberId, type, startDate, endDate],
    queryFn: () =>
      checkinsService.listCheckins({
        houseId: houseId!,
        page,
        limit: 20,
        memberId,
        type,
        startDate,
        endDate,
      }),
    enabled: !!houseId,
  })
}

export function useRegisterCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterCheckinRequest) =>
      checkinsService.registerCheckin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] })
      toast.success('Check-in registrado')
    },
    onError: () => {
      toast.error('Erro ao registrar check-in')
    },
  })
}

export function useRegisterBulkCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterBulkCheckinRequest) =>
      checkinsService.registerBulkCheckin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] })
      toast.success('Check-ins registrados em lote')
    },
    onError: () => {
      toast.error('Erro ao registrar check-ins em lote')
    },
  })
}

export function useMemberCheckinSummary(memberId: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['checkin-summary', houseId, memberId],
    queryFn: () =>
      checkinsService.getMemberCheckinSummary({
        houseId: houseId!,
        memberId,
      }),
    enabled: !!houseId && !!memberId,
  })
}
