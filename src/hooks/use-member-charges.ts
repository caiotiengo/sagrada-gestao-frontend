'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { memberChargesService } from '@/services/member-charges'
import type {
  CreateMemberChargeRequest,
  ListMemberChargesRequest,
  MemberChargeActionRequest,
  RejectMemberChargeRequest,
  PayMemberChargeRequest,
} from '@/types'
import { toast } from 'sonner'
import { invalidateFinance } from '@/lib/invalidate'
import { getErrorMessage } from '@/lib/errors'

export function useMemberCharges(
  filter: NonNullable<ListMemberChargesRequest['filter']> = 'all',
  status: NonNullable<ListMemberChargesRequest['status']> = 'all',
  page = 1,
) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['member-charges', houseId, filter, status, page],
    queryFn: () =>
      memberChargesService.listMemberCharges({ houseId: houseId!, filter, status, page, limit: 30 }),
    enabled: !!houseId,
  })
}

function useChargeMutation<T>(fn: (data: T) => Promise<unknown>, success: string, fallback: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      // Pagamento contra a casa lança despesa no ledger: invalida o financeiro todo.
      invalidateFinance(queryClient)
      toast.success(success)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, fallback))
    },
  })
}

export function useCreateMemberCharge() {
  return useChargeMutation(
    (data: CreateMemberChargeRequest) => memberChargesService.createMemberCharge(data),
    'Cobrança criada',
    'Erro ao criar cobrança',
  )
}

export function useAcceptMemberCharge() {
  return useChargeMutation(
    (data: MemberChargeActionRequest) => memberChargesService.acceptMemberCharge(data),
    'Cobrança validada',
    'Erro ao validar cobrança',
  )
}

export function useRejectMemberCharge() {
  return useChargeMutation(
    (data: RejectMemberChargeRequest) => memberChargesService.rejectMemberCharge(data),
    'Cobrança rejeitada',
    'Erro ao rejeitar cobrança',
  )
}

export function usePayMemberCharge() {
  return useChargeMutation(
    (data: PayMemberChargeRequest) => memberChargesService.payMemberCharge(data),
    'Recebimento confirmado',
    'Erro ao confirmar recebimento',
  )
}

export function useCancelMemberCharge() {
  return useChargeMutation(
    (data: MemberChargeActionRequest) => memberChargesService.cancelMemberCharge(data),
    'Cobrança cancelada',
    'Erro ao cancelar cobrança',
  )
}
