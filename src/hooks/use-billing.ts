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
    // O bloqueio/desbloqueio vem do webhook: confere de tempos em tempos e ao voltar para a aba.
    refetchInterval: opts.refetchInterval ?? 5 * 60 * 1000,
    refetchOnWindowFocus: true,
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
    mutationFn: (v: { plan: PaidPlanId; interval: BillingInterval; method?: 'card' | 'boleto' }) => billingService.checkout({ houseId: houseId!, ...v }),
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

/** PIX de um período: leva à página do Stripe com o QR e o copia-e-cola. */
export function useStartPixCheckout() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  return useMutation({
    mutationFn: (v: { plan: PaidPlanId; interval: BillingInterval }) => billingService.pixCheckout({ houseId: houseId!, ...v }),
    onSuccess: (r) => go(r.url),
    onError: (e) => toast.error(getErrorMessage(e, 'Não foi possível gerar o PIX')),
  })
}
