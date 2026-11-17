import { callFunction } from '@/lib/callable'

// Tipos do retorno de getHouseBilling. O catálogo de planos vem do back
// (functions/src/constants/plans.ts, fonte única): esta tela não tem cópia.

export type PlanId = 'semente' | 'casa' | 'casa-grande'
export type PaidPlanId = Exclude<PlanId, 'semente'>
export type BillingInterval = 'month' | 'year'
export type PlanFeature = 'store' | 'raffles' | 'campaigns' | 'shoppingLists' | 'publicOrders' | 'push' | 'permissions'
export type SubscriptionStatus =
  | 'none' | 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'paused'
export type PlanSource = 'subscription' | 'trial' | 'grace' | 'legacy_courtesy' | 'free'

export interface BillingWarning {
  code: 'legacy_courtesy' | 'past_due_grace' | 'past_due_expired' | 'cancel_scheduled' | 'trial_ending' | 'over_member_limit' | 'near_member_limit'
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
  courtesyUntil: string | null
  hasStripeCustomer: boolean
  hasActiveSubscription: boolean
  warnings: BillingWarning[]
  activeMembers: number
  canManage: boolean
  trialDays: number
  trialAvailable: boolean
  lastInvoice: { status: string; amountCents: number; at: string | null } | null
  plans: PlanCatalogItem[]
}

export const billingService = {
  get: (houseId: string) => callFunction<{ houseId: string }, HouseBilling>('getHouseBilling', { houseId }),
  checkout: (data: { houseId: string; plan: PaidPlanId; interval: BillingInterval }) =>
    callFunction<typeof data, { url: string; sessionId: string }>('createCheckoutSession', data),
  portal: (houseId: string) => callFunction<{ houseId: string }, { url: string }>('createBillingPortalSession', { houseId }),
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))
}
