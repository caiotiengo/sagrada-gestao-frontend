'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from '@/services/dashboard'

export function useDashboardSummary() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const isAdmin = useAuthStore((s) => s.isAdmin())

  return useQuery({
    queryKey: ['dashboard', 'summary', houseId],
    queryFn: () => dashboardService.getDashboardSummary({ houseId: houseId! }),
    enabled: !!houseId && isAdmin,
    staleTime: 2 * 60 * 1000,
  })
}
