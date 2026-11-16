'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { meService } from '@/services/me'

/** Resumo pessoal: próxima mensalidade, contribuições do ano/mês e eventos confirmados. */
export function useMyDashboard() {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['my-dashboard', houseId],
    queryFn: () => meService.getMyDashboard({ houseId: houseId! }),
    enabled: !!houseId,
  })
}
