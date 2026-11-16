'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invalidateFinance } from '@/lib/invalidate'
import { getErrorMessage } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth'
import { ledgerService } from '@/services/ledger'
import type {
  FinancialStatementFilters,
  LedgerFilters,
  ReverseLedgerEntryRequest,
} from '@/types/ledger'

// ---- Financial Statement (unified) ----

export function useFinancialStatement(
  filters: Omit<FinancialStatementFilters, 'houseId'> = {},
) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const query: FinancialStatementFilters = { houseId: houseId!, ...filters }

  return useQuery({
    queryKey: ['financial-statement', query],
    queryFn: () => ledgerService.getFinancialStatement(query),
    enabled: !!houseId,
    staleTime: 30_000,
  })
}

// ---- Ledger (raw entries, admin-only) ----

export function useLedger(filters: Omit<LedgerFilters, 'houseId'> = {}) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const query: LedgerFilters = { houseId: houseId!, ...filters }

  return useQuery({
    queryKey: ['ledger', query],
    queryFn: () => ledgerService.getLedger(query),
    enabled: !!houseId,
    staleTime: 30_000,
  })
}

// ---- Validation ----

export function useValidateLedger(enabled = true) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['validate-ledger', houseId],
    queryFn: () => ledgerService.validateHouseLedger({ houseId: houseId! }),
    enabled: !!houseId && enabled,
    staleTime: 60_000,
  })
}

// ---- Reconcile summary ----

export function useReconcileSummary() {
  const qc = useQueryClient()
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useMutation({
    mutationFn: () => ledgerService.reconcileHouseSummaryFromLedger({ houseId: houseId! }),
    onSuccess: () => {
      invalidateFinance(qc)
      toast.success('Saldos recalculados')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao recalcular saldos'))
    },
  })
}

// ---- Reverse entry ----

export function useReverseLedgerEntry() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: ReverseLedgerEntryRequest) => ledgerService.reverseLedgerEntry(data),
    onSuccess: () => {
      invalidateFinance(qc)
      toast.success('Estorno registrado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao estornar'))
    },
  })
}

// ---- Backfill ----

export function useBackfillLedger() {
  const qc = useQueryClient()
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useMutation({
    mutationFn: () => ledgerService.backfillHouseLedger({ houseId: houseId! }),
    onSuccess: () => {
      invalidateFinance(qc)
    },
  })
}
