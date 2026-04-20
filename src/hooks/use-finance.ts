'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { financeService } from '@/services/finance'
import type {
  CreateMonthlyFeeRequest,
  CreateBulkMonthlyFeesRequest,
  UpdateMonthlyFeeRequest,
  PayMonthlyFeeRequest,
  DeleteMonthlyFeeRequest,
  CreatePaymentRequest,
  DeletePaymentRequest,
  CreateDebtRequest,
  PayDebtRequest,
  DeleteDebtRequest,
  FeeStatus,
  PaymentType,
  ListFinancialStatementRequest,
  CreatePaymentTagRequest,
  DeletePaymentTagRequest,
  CreateRecurringMonthlyFeeRequest,
} from '@/types'
import { toast } from 'sonner'
import { trackPayment, trackFeePayment, trackDebtPayment } from '@/lib/analytics'

// ---- Monthly Fees ----

export function useMonthlyFees(page = 1, memberId?: string, status?: FeeStatus, referenceMonth?: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['monthly-fees', houseId, page, memberId, status, referenceMonth],
    queryFn: () =>
      financeService.listMonthlyFees({
        houseId: houseId!,
        page,
        limit: 20,
        memberId,
        status,
        referenceMonth,
      }),
    enabled: !!houseId,
  })
}

export function useCreateMonthlyFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMonthlyFeeRequest) =>
      financeService.createMonthlyFee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-fees'] })
      toast.success('Mensalidade criada')
    },
    onError: () => {
      toast.error('Erro ao criar mensalidade')
    },
  })
}

export function useCreateBulkMonthlyFees() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBulkMonthlyFeesRequest) =>
      financeService.createBulkMonthlyFees(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-fees'] })
      toast.success('Mensalidades criadas em lote')
    },
    onError: () => {
      toast.error('Erro ao criar mensalidades em lote')
    },
  })
}

export function useUpdateMonthlyFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateMonthlyFeeRequest) =>
      financeService.updateMonthlyFee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-fees'] })
      toast.success('Mensalidade atualizada')
    },
    onError: () => {
      toast.error('Erro ao atualizar mensalidade')
    },
  })
}

export function usePayMonthlyFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PayMonthlyFeeRequest) =>
      financeService.payMonthlyFee(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-fees'] })
      toast.success('Pagamento registrado')
      trackFeePayment(data.amount ?? 0, variables.paymentMethod)
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento')
    },
  })
}

export function useDeleteMonthlyFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteMonthlyFeeRequest) =>
      financeService.deleteMonthlyFee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-fees'] })
      queryClient.invalidateQueries({ queryKey: ['financial-statement'] })
      toast.success('Mensalidade excluída')
    },
    onError: () => {
      toast.error('Erro ao excluir mensalidade')
    },
  })
}

// ---- Payments ----

export function usePayments(page = 1, type?: PaymentType, category?: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['payments', houseId, page, type, category],
    queryFn: () =>
      financeService.listPayments({
        houseId: houseId!,
        page,
        limit: 20,
        type,
        category,
      }),
    enabled: !!houseId,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      financeService.createPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Pagamento criado')
      trackPayment(variables.category, variables.amount, variables.type)
    },
    onError: () => {
      toast.error('Erro ao criar pagamento')
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeletePaymentRequest) =>
      financeService.deletePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['financial-statement'] })
      toast.success('Pagamento excluído')
    },
    onError: () => {
      toast.error('Erro ao excluir pagamento')
    },
  })
}

// ---- Debts ----

export function useDebts(page = 1, memberId?: string, status?: FeeStatus) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['debts', houseId, page, memberId, status],
    queryFn: () =>
      financeService.listDebts({
        houseId: houseId!,
        page,
        limit: 20,
        memberId,
        status,
      }),
    enabled: !!houseId,
  })
}

export function useCreateDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDebtRequest) =>
      financeService.createDebt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      toast.success('Débito criado')
    },
    onError: () => {
      toast.error('Erro ao criar débito')
    },
  })
}

export function usePayDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PayDebtRequest) =>
      financeService.payDebt(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      toast.success('Pagamento de débito registrado')
      trackDebtPayment(variables.amount)
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento de débito')
    },
  })
}

export function useDeleteDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteDebtRequest) =>
      financeService.deleteDebt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      queryClient.invalidateQueries({ queryKey: ['financial-statement'] })
      toast.success('Dívida excluída')
    },
    onError: () => {
      toast.error('Erro ao excluir dívida')
    },
  })
}

// ---- Financial Statement (LEGACY) ----
/** @deprecated Use `useFinancialStatement` from `@/hooks/use-ledger` instead. */
export function useLegacyFinancialStatement(
  page = 1,
  type?: 'income' | 'expense' | 'all',
  source?: ListFinancialStatementRequest['source'],
  startDate?: string,
  endDate?: string,
) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['legacy-financial-statement', houseId, page, type, source, startDate, endDate],
    queryFn: () =>
      financeService.listFinancialStatement({
        houseId: houseId!,
        page,
        limit: 30,
        type,
        source,
        startDate,
        endDate,
      }),
    enabled: !!houseId,
  })
}

// ---- My Financial Summary (LEGACY) ----
/** @deprecated Use `useFinancialStatement` from `@/hooks/use-ledger` instead. */
export function useLegacyMyFinancialSummary(referenceMonth?: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['legacy-my-financial-summary', houseId, referenceMonth],
    queryFn: () =>
      financeService.getMyFinancialSummary({
        houseId: houseId!,
        referenceMonth,
      }),
    enabled: !!houseId,
  })
}

// ---- Member Financial Summary (LEGACY) ----
/** @deprecated Use `useFinancialStatement` from `@/hooks/use-ledger` with memberId param instead. */
export function useLegacyMemberFinancialSummary(memberId: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['legacy-member-financial-summary', houseId, memberId],
    queryFn: () =>
      financeService.getMemberFinancialSummary({
        houseId: houseId!,
        memberId,
      }),
    enabled: !!houseId && !!memberId,
  })
}

// ---- Payment Tags ----

export function usePaymentTags() {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['payment-tags', houseId],
    queryFn: () => financeService.listPaymentTags({ houseId: houseId! }),
    enabled: !!houseId,
  })
}

export function useCreatePaymentTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentTagRequest) =>
      financeService.createPaymentTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-tags'] })
      toast.success('Tag criada')
    },
    onError: () => {
      toast.error('Erro ao criar tag')
    },
  })
}

export function useDeletePaymentTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeletePaymentTagRequest) =>
      financeService.deletePaymentTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-tags'] })
      toast.success('Tag excluída')
    },
    onError: () => {
      toast.error('Erro ao excluir tag')
    },
  })
}

// ---- Recurring Monthly Fee ----

export function useCreateRecurringMonthlyFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecurringMonthlyFeeRequest) =>
      financeService.createRecurringMonthlyFee(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-fees'] })
      toast.success(`${data.created} mensalidade(s) criada(s)`)
    },
    onError: () => {
      toast.error('Erro ao criar mensalidades')
    },
  })
}
