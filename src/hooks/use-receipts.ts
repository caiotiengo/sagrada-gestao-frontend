'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { receiptsService } from '@/services/receipts'
import { useHouseBilling } from '@/hooks/use-billing'
import { invalidateFinance } from '@/lib/invalidate'
import { getErrorMessage } from '@/lib/errors'
import type { ApproveReceiptRequest, ReceiptListFilter, ReceiptView } from '@/types/receipts'

/** Comprovantes do próprio filho ("Meus comprovantes"). */
export function useMyReceipts(limit = 20) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useQuery({
    queryKey: ['receipts', 'mine', houseId, limit],
    queryFn: () => receiptsService.listMine({ houseId: houseId!, limit }),
    enabled: !!houseId,
  })
}

/** Quem vê a fila: Liderança ou "Cuida das mensalidades e do caixa". */
export function useCanReviewReceipts() {
  return useAuthStore((s) => s.hasPermission('canManageCashier'))
}

export function useHouseReceipts(filter: ReceiptListFilter, enabled = true) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useQuery({
    queryKey: ['receipts', 'house', houseId, filter],
    queryFn: () => receiptsService.listHouse({ houseId: houseId!, filter, limit: 100 }),
    enabled: !!houseId && enabled,
  })
}

/** Contador do menu: quantos comprovantes esperam conferência. */
export function usePendingReceiptsCount() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canReview = useCanReviewReceipts()
  // Casa bloqueada recusa a chamada (house_blocked): não consulta nem fica repetindo a cada minuto.
  const blocked = useHouseBilling().data?.access === 'blocked'
  return useQuery({
    queryKey: ['receipts', 'house', houseId, 'count'],
    queryFn: () => receiptsService.listHouse({ houseId: houseId!, filter: 'review', limit: 1 }),
    enabled: !!houseId && canReview && !blocked,
    select: (d) => d.pendingReviewCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useReceiptDetail(receiptId: string | null) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useQuery({
    queryKey: ['receipts', 'detail', houseId, receiptId],
    queryFn: () => receiptsService.get({ houseId: houseId!, receiptId: receiptId! }),
    enabled: !!houseId && !!receiptId,
  })
}

export function useReceiptFile(receiptId: string | null, enabled = true) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useQuery({
    // Arquivo não muda: fica em cache enquanto a tela estiver aberta.
    queryKey: ['receipt-file', houseId, receiptId],
    queryFn: () => receiptsService.getFile({ houseId: houseId!, receiptId: receiptId! }),
    enabled: !!houseId && !!receiptId && enabled,
    staleTime: Infinity,
  })
}

export function useReceiptSettings() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canReview = useCanReviewReceipts()
  return useQuery({
    queryKey: ['receipts', 'settings', houseId],
    queryFn: () => receiptsService.getSettings({ houseId: houseId! }),
    enabled: !!houseId && canReview,
  })
}

/** Envio do comprovante: o erro fica para a tela mostrar junto do arquivo. */
export function useSubmitReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: receiptsService.submit,
    onSuccess: () => {
      invalidateFinance(queryClient)
    },
  })
}

function useReceiptAction<T>(fn: (data: T) => Promise<ReceiptView>, success: string, fallback: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      invalidateFinance(queryClient)
      toast.success(success)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, fallback))
    },
  })
}

export function useApproveReceipt() {
  return useReceiptAction(
    (data: ApproveReceiptRequest) => receiptsService.approve(data),
    'Comprovante aprovado. Baixa feita.',
    'Não foi possível aprovar o comprovante',
  )
}

export function useRejectReceipt() {
  return useReceiptAction(
    (data: { houseId: string; receiptId: string; reason: string }) => receiptsService.reject(data),
    'Comprovante recusado. O filho vai ver o motivo.',
    'Não foi possível recusar o comprovante',
  )
}

export function useReverseReceipt() {
  return useReceiptAction(
    (data: { houseId: string; receiptId: string; reason: string }) => receiptsService.reverse(data),
    'Baixa desfeita. O valor voltou a ficar em aberto.',
    'Não foi possível desfazer a baixa',
  )
}

export function useUpdateReceiptSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: receiptsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts', 'settings'] })
      toast.success('Configuração salva')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível salvar a configuração')),
  })
}
