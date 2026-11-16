'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from '@/services/dashboard'
import { getErrorMessage } from '@/lib/errors'
import { invalidateFinance } from '@/lib/invalidate'
import { formatCurrency } from '@/utils'

export function useDashboardSummary() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  // O back aceita admin ou canManageCashier (hasPermission cobre os dois).
  const canView = useAuthStore((s) => s.hasPermission('canManageCashier'))

  return useQuery({
    queryKey: ['dashboard', 'summary', houseId],
    queryFn: () => dashboardService.getDashboardSummary({ houseId: houseId! }),
    enabled: !!houseId && canView,
    staleTime: 2 * 60 * 1000,
  })
}

export function useRecalculateHouseSummary() {
  const queryClient = useQueryClient()
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useMutation({
    mutationFn: () => dashboardService.recalculateHouseSummary({ houseId: houseId! }),
    onSuccess: (result) => {
      invalidateFinance(queryClient)
      toast.success(`Saldo recalculado: ${formatCurrency(result.balance)}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao recalcular saldo'))
    },
  })
}
