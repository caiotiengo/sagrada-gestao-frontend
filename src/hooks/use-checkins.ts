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
import { getErrorMessage } from '@/lib/errors'

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
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] })
      if (result?.alreadyRegistered) {
        toast.info('Este membro já tinha check-in registrado')
      } else {
        toast.success('Check-in registrado')
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar check-in'))
    },
  })
}

export function useRegisterBulkCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterBulkCheckinRequest) =>
      checkinsService.registerBulkCheckin(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] })
      const registered = result?.registered ?? result?.count
      if (registered === undefined) {
        toast.success('Check-ins registrados em lote')
        return
      }
      const parts = [`${registered} registrado(s)`]
      if (result.alreadyRegistered) parts.push(`${result.alreadyRegistered} já tinha(m) check-in`)
      if (result.ignored) parts.push(`${result.ignored} ignorado(s) (não são membros ativos)`)
      toast.success(`Check-ins: ${parts.join(', ')}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar check-ins em lote'))
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
