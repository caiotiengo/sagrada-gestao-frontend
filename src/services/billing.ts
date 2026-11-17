import { callFunction } from '@/lib/callable'

// Tipos do retorno de getHouseBilling. O catálogo de planos vem do back
// (functions/src/constants/plans.ts, fonte única): esta tela não tem cópia.

export type PlanId = 'casa' | 'casa-grande'
export type PaidPlanId = PlanId
export type BillingInterval = 'month' | 'year'
export type PlanFeature = 'store' | 'raffles' | 'campaigns' | 'shoppingLists' | 'publicOrders' | 'push' | 'permissions'
export type SubscriptionStatus =
  | 'none' | 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'paused'
export type PlanSource = 'subscription' | 'pix' | 'trial' | 'legacy_courtesy' | 'grace' | 'blocked'
/** ok | pending (pagamento pendente, dias 1..15, tudo funciona) | blocked (acesso suspenso, só regularizar). */
export type BillingAccess = 'ok' | 'pending' | 'blocked'
export type BillingMode = 'none' | 'stripe' | 'pix'
export type PaymentMethod = 'card' | 'boleto' | 'pix'

export interface BillingWarning {
  code: 'legacy_courtesy' | 'payment_pending' | 'payment_blocked' | 'pix_renewal_due' | 'cancel_scheduled' | 'trial_ending' | 'over_member_limit' | 'near_member_limit'
  severity: 'info' | 'warning' | 'danger'
  message: string
}

export interface PlanCatalogItem {
  id: PlanId
  name: string
  tagline: string
  monthlyCents: number
  yearlyCents: number
  memberLimit: number | null
  paidFeatures: PlanFeature[]
  paidFeatureLabels: string[]
  features: string[]
  highlighted?: boolean
}

export interface PendingPlanChange {
  plan: PaidPlanId
  interval: BillingInterval
  /** schedule = agendado no Stripe para o fim do período; pix = vale no próximo PIX. */
  via: 'schedule' | 'pix'
  effectiveAt: string | null
}

export type PlanChangeEffect = 'trial_swap' | 'upgraded_now' | 'downgrade_scheduled' | 'pix_next_period' | 'pending_canceled'

export interface PlanChangeResult {
  effect: PlanChangeEffect
  plan: PaidPlanId
  interval: BillingInterval
  effectiveAt: string | null
  trialEnd: string | null
}

export interface HouseBilling {
  houseId: string
  plan: PlanId
  planName: string
  source: PlanSource
  memberLimit: number | null
  features: PlanFeature[]
  status: SubscriptionStatus
  subscribedPlan: PlanId
  interval: BillingInterval | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
  graceEndsAt: string | null
  access: BillingAccess
  pendingDay: number | null
  pendingSince: string | null
  blocksAt: string | null
  billingMode: BillingMode
  coveredUntil: string | null
  courtesyUntil: string | null
  hasStripeCustomer: boolean
  hasActiveSubscription: boolean
  warnings: BillingWarning[]
  activeMembers: number
  canManage: boolean
  trialDays: number
  paymentMethods: PaymentMethod[]
  pixEnabled: boolean
  pendingPix: { plan: PaidPlanId; interval: BillingInterval; createdAt: string | null; expiresAt: string | null } | null
  /** Troca de plano pedida e ainda não valendo (rebaixamento agendado ou próximo PIX). */
  pendingPlanChange: PendingPlanChange | null
  lastInvoice: { status: string; amountCents: number; at: string | null; method: string | null; hostedInvoiceUrl: string | null } | null
  plans: PlanCatalogItem[]
}

export const billingService = {
  get: (houseId: string) => callFunction<{ houseId: string }, HouseBilling>('getHouseBilling', { houseId }),
  checkout: (data: { houseId: string; plan: PaidPlanId; interval: BillingInterval; method?: 'card' | 'boleto' }) =>
    callFunction<typeof data, { url: string; sessionId: string }>('createCheckoutSession', data),
  pixCheckout: (data: { houseId: string; plan: PaidPlanId; interval: BillingInterval }) =>
    callFunction<typeof data, { url: string; sessionId: string; amountCents: number }>('createPixCheckout', data),

  /** Troca de plano pela nossa página (o Portal do Sagrada não troca plano). */
  changePlan: (data: { houseId: string; plan: PaidPlanId; interval: BillingInterval }) =>
    callFunction<typeof data, PlanChangeResult>('changeSubscriptionPlan', data),

  portal: (houseId: string) => callFunction<{ houseId: string }, { url: string }>('createBillingPortalSession', { houseId }),
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))
}
