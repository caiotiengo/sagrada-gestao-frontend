'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { billingService, type BillingInterval, type PaidPlanId, type PlanFeature } from '@/services/billing'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/lib/errors'

export const billingKey = (houseId: string | null) => ['house', houseId, 'billing'] as const

/** Plano efetivo da casa atual (qualquer membro lê). */
export function useHouseBilling(opts: { refetchInterval?: number | false } = {}) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useQuery({
    queryKey: billingKey(houseId),
    queryFn: () => billingService.get(houseId!),
    enabled: !!houseId,
    staleTime: 60 * 1000,
    refetchInterval: opts.refetchInterval,
  })
}

/** true/false quando já carregou; undefined enquanto não sabe (não bloqueia a tela por isso). */
export function useHasFeature(feature: PlanFeature): boolean | undefined {
  const q = useHouseBilling()
  return q.data ? q.data.features.includes(feature) : undefined
}

function go(url: string) {
  window.location.assign(url)
}

export function useStartCheckout() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useMutation({
    mutationFn: (v: { plan: PaidPlanId; interval: BillingInterval }) => billingService.checkout({ houseId: houseId!, ...v }),
    onSuccess: (r) => go(r.url),
    onError: (e) => toast.error(getErrorMessage(e, 'Não foi possível abrir a página de pagamento')),
  })
}

export function useOpenBillingPortal() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useMutation({
    mutationFn: () => billingService.portal(houseId!),
    onSuccess: (r) => go(r.url),
    onError: (e) => toast.error(getErrorMessage(e, 'Não foi possível abrir o portal da assinatura')),
  })
}
