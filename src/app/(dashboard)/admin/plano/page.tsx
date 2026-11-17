'use client'

import { useState } from 'react'
import { AlertTriangle, Check, CreditCard, Info, Users } from 'lucide-react'
import { useHouseBilling, useOpenBillingPortal, useStartCheckout } from '@/hooks/use-billing'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import {
  formatBRL,
  formatDateBR,
  type BillingInterval,
  type BillingWarning,
  type HouseBilling,
  type PlanCatalogItem,
} from '@/services/billing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/error-state'

const WARNING_STYLE: Record<BillingWarning['severity'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
  danger: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200',
}

function statusLabel(b: HouseBilling): { text: string; tone: 'ok' | 'warn' | 'bad' | 'muted' } {
  switch (b.source) {
    case 'subscription':
      return b.cancelAtPeriodEnd
        ? { text: `Assinatura cancelada: vale até ${formatDateBR(b.currentPeriodEnd)}`, tone: 'warn' }
        : { text: `Assinatura ativa${b.currentPeriodEnd ? `, renova em ${formatDateBR(b.currentPeriodEnd)}` : ''}`, tone: 'ok' }
    case 'trial':
      return { text: `Teste grátis até ${formatDateBR(b.trialEnd)}`, tone: 'ok' }
    case 'grace':
      return { text: `Pagamento atrasado: regularize até ${formatDateBR(b.graceEndsAt)}`, tone: 'bad' }
    case 'legacy_courtesy':
      return { text: `Cortesia até ${formatDateBR(b.courtesyUntil)}`, tone: 'ok' }
    default:
      if (b.status === 'past_due' || b.status === 'unpaid') return { text: 'Pagamento pendente', tone: 'bad' }
      if (b.status === 'incomplete') return { text: 'Aguardando a confirmação do primeiro pagamento', tone: 'warn' }
      return { text: 'Plano grátis', tone: 'muted' }
  }
}

const TONE: Record<string, string> = {
  ok: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  warn: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  bad: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200',
  muted: 'bg-muted text-muted-foreground',
}

export default function BillingPage() {
  const billing = useHouseBilling()
  const [interval, setBillingInterval] = useState<BillingInterval>('month')

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Plano e cobrança</h1>
        <p className="text-sm text-muted-foreground">O plano da casa define quantas pessoas podem participar e quais recursos ficam liberados.</p>
      </div>

      {billing.isError ? (
        <ErrorState message={getErrorMessage(billing.error, 'Não foi possível carregar o plano da casa')} onRetry={() => billing.refetch()} />
      ) : billing.isLoading || !billing.data ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        <BillingContent b={billing.data} interval={interval} setBillingInterval={setBillingInterval} />
      )}
    </div>
  )
}

function BillingContent({ b, interval, setBillingInterval }: { b: HouseBilling; interval: BillingInterval; setBillingInterval: (i: BillingInterval) => void }) {
  const checkout = useStartCheckout()
  const portal = useOpenBillingPortal()
  const status = statusLabel(b)
  const limit = b.memberLimit
  const usagePct = limit ? Math.min(100, Math.round((b.activeMembers / limit) * 100)) : 0
  const busy = checkout.isPending || portal.isPending

  return (
    <>
      {b.warnings.length > 0 && (
        <div className="space-y-2" data-testid="billing-warnings">
          {b.warnings.map((w) => (
            <div key={w.code} className={cn('flex items-start gap-3 rounded-xl border p-3 text-sm', WARNING_STYLE[w.severity])} data-testid={`billing-warning-${w.code}`}>
              {w.severity === 'info' ? <Info className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
              <p>{w.message}</p>
            </div>
          ))}
        </div>
      )}

      <section className="grid gap-4 rounded-xl border bg-card p-4 sm:p-5 md:grid-cols-[1fr_1fr_auto] md:items-center" data-testid="billing-current">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plano atual</p>
          <p className="text-2xl font-semibold" data-testid="billing-plan-name">{b.planName}</p>
          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', TONE[status.tone])} data-testid="billing-status">
            {status.text}
          </span>
          {b.interval && b.source !== 'legacy_courtesy' && b.subscribedPlan !== 'semente' && (
            <p className="text-xs text-muted-foreground">Cobrança {b.interval === 'year' ? 'anual' : 'mensal'}</p>
          )}
        </div>

        <div className="space-y-2" data-testid="billing-usage">
          <p className="flex items-center gap-1.5 text-sm font-medium"><Users className="size-4" /> Pessoas ativas</p>
          <p className="text-sm">
            <span className="text-lg font-semibold" data-testid="billing-active-members">{b.activeMembers}</span>
            <span className="text-muted-foreground"> {limit ? `de ${limit}` : '(sem limite)'}</span>
          </p>
          {limit !== null && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={usagePct} aria-valuemin={0} aria-valuemax={100}>
              <div className={cn('h-full rounded-full', usagePct >= 100 ? 'bg-red-500' : usagePct >= 90 ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${usagePct}%` }} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          {b.canManage && b.hasStripeCustomer && (
            <Button variant="outline" onClick={() => portal.mutate()} disabled={busy} data-testid="billing-portal">
              <CreditCard className="size-4" /> {portal.isPending ? 'Abrindo...' : 'Gerenciar assinatura'}
            </Button>
          )}
          {b.canManage && b.hasStripeCustomer && (
            <p className="max-w-56 text-xs text-muted-foreground md:text-right">Trocar plano ou cartão, cancelar e ver as faturas.</p>
          )}
          {b.lastInvoice && (
            <p className="text-xs text-muted-foreground md:text-right">
              Última fatura: {formatBRL(b.lastInvoice.amountCents)} ({b.lastInvoice.status === 'paid' ? 'paga' : 'não paga'}{b.lastInvoice.at ? ` em ${formatDateBR(b.lastInvoice.at)}` : ''})
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Planos</h2>
          <div className="inline-flex rounded-lg border p-0.5" role="group" aria-label="Período de cobrança">
            {(['month', 'year'] as const).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBillingInterval(i)}
                aria-pressed={interval === i}
                className={cn('rounded-md px-3 py-1 text-sm font-medium', interval === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                data-testid={`billing-interval-${i}`}
              >
                {i === 'month' ? 'Mensal' : 'Anual'}
              </button>
            ))}
          </div>
        </div>

        {b.trialAvailable && b.canManage && (
          <p className="text-sm text-muted-foreground" data-testid="billing-trial">
            A primeira assinatura começa com {b.trialDays} dias grátis. A cobrança só acontece depois.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {b.plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              b={b}
              interval={interval}
              busy={busy}
              onSubscribe={() => p.id !== 'semente' && checkout.mutate({ plan: p.id, interval })}
              onPortal={() => portal.mutate()}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Pagamento por cartão de crédito ou boleto, processado pelo Stripe. O boleto ativa o plano quando o banco confirma (até 1 dia útil).
          Ao trocar para um plano menor ou cancelar, nada é apagado: o que passar do plano fica só para leitura.
        </p>
        {!b.canManage && (
          <p className="text-sm text-muted-foreground" data-testid="billing-readonly">Só a liderança da casa pode assinar ou mudar o plano.</p>
        )}
      </section>
    </>
  )
}

function PlanCard({
  plan,
  b,
  interval,
  busy,
  onSubscribe,
  onPortal,
}: {
  plan: PlanCatalogItem
  b: HouseBilling
  interval: BillingInterval
  busy: boolean
  onSubscribe: () => void
  onPortal: () => void
}) {
  const isCurrent = plan.id === b.plan
  const free = plan.monthlyCents === 0
  const price = interval === 'year' ? plan.yearlyCents : plan.monthlyCents
  const monthsFree = !free && interval === 'year' ? Math.round((plan.monthlyCents * 12 - plan.yearlyCents) / plan.monthlyCents) : 0

  let action: React.ReactNode = null
  if (b.canManage && !free) {
    if (b.hasActiveSubscription) {
      action = isCurrent && b.subscribedPlan === plan.id
        ? <Button variant="outline" className="w-full" disabled>Seu plano</Button>
        : <Button variant="outline" className="w-full" onClick={onPortal} disabled={busy} data-testid={`billing-change-${plan.id}`}>Mudar para {plan.name}</Button>
    } else {
      action = (
        <Button className="w-full" onClick={onSubscribe} disabled={busy} data-testid={`billing-subscribe-${plan.id}`}>
          Assinar {plan.name}
        </Button>
      )
    }
  }

  return (
    <div
      className={cn('flex flex-col gap-4 rounded-xl border bg-card p-5', plan.highlighted && 'border-primary shadow-sm shadow-primary/10', isCurrent && 'ring-2 ring-primary/40')}
      data-testid={`billing-plan-${plan.id}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{plan.name}</h3>
          {isCurrent && <Badge>Atual</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{plan.tagline}</p>
      </div>
      <div>
        {free ? (
          <p className="text-2xl font-semibold">Grátis</p>
        ) : (
          <>
            <p className="text-2xl font-semibold" data-testid={`billing-price-${plan.id}`}>
              {formatBRL(price)}
              <span className="text-sm font-normal text-muted-foreground">/{interval === 'year' ? 'ano' : 'mês'}</span>
            </p>
            {monthsFree > 0 && <p className="text-xs text-muted-foreground">Equivale a {monthsFree} meses grátis no ano</p>}
          </>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{plan.memberLimit ? `Até ${plan.memberLimit} pessoas` : 'Pessoas sem limite'}</p>
      </div>
      <ul className="flex-1 space-y-1.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>
        ))}
      </ul>
      {action}
    </div>
  )
}
