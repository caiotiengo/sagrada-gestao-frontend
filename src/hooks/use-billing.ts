'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { billingService, formatDateBR, type BillingInterval, type PaidPlanId, type PlanChangeResult, type PlanFeature } from '@/services/billing'
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

function planChangeToast(r: PlanChangeResult): string {
  switch (r.effect) {
    case 'trial_swap':
      return `Plano trocado. Seus dias grátis continuam até ${formatDateBR(r.trialEnd)}.`
    case 'upgraded_now':
      return 'Plano trocado. Já está valendo.'
    case 'downgrade_scheduled':
      return `Troca agendada para ${formatDateBR(r.effectiveAt)}.`
    case 'pix_next_period':
      return 'Combinado: o plano novo vale no próximo pagamento por PIX.'
    case 'pending_canceled':
      return 'Troca de plano desfeita.'
  }
}

/** Troca de plano (Casa ↔ Casa Grande, mensal ↔ anual). O estado novo chega pelo webhook: recarrega em seguida. */
export function useChangePlan() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { plan: PaidPlanId; interval: BillingInterval }) => billingService.changePlan({ houseId: houseId!, ...v }),
    onSuccess: (r) => {
      toast.success(planChangeToast(r))
      qc.invalidateQueries({ queryKey: billingKey(houseId) })
      // O webhook do Stripe pode chegar alguns segundos depois.
      setTimeout(() => qc.invalidateQueries({ queryKey: billingKey(houseId) }), 4000)
    },
    onError: (e) => toast.error(getErrorMessage(e, 'Não foi possível trocar o plano')),
  })
}
