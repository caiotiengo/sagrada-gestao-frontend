'use client'

import { useState } from 'react'
import { AlertTriangle, Barcode, Check, CreditCard, ExternalLink, Info, Lock, QrCode, Users } from 'lucide-react'
import { useHouseBilling, useOpenBillingPortal, useStartCheckout, useStartPixCheckout } from '@/hooks/use-billing'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import {
  formatBRL,
  formatDateBR,
  type BillingInterval,
  type BillingWarning,
  type HouseBilling,
  type PaymentMethod,
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

const METHOD_INFO: Record<PaymentMethod, { label: string; hint: string; icon: typeof CreditCard }> = {
  card: { label: 'Cartão', hint: 'Cobrança automática todo período.', icon: CreditCard },
  boleto: { label: 'Boleto', hint: 'Boleto a cada período; ativa quando o banco confirma (até 1 dia útil).', icon: Barcode },
  pix: { label: 'PIX', hint: 'Você paga cada período pelo QR ou copia-e-cola. Confirma na hora; não renova sozinho.', icon: QrCode },
}

function statusLabel(b: HouseBilling): { text: string; tone: 'ok' | 'warn' | 'bad' | 'muted' } {
  switch (b.source) {
    case 'blocked':
      return { text: 'Acesso suspenso: pagamento pendente', tone: 'bad' }
    case 'grace':
      return { text: `Pagamento pendente: regularize até ${formatDateBR(b.graceEndsAt)}`, tone: 'bad' }
    case 'subscription':
      if (b.status === 'canceled' || b.cancelAtPeriodEnd) return { text: `Assinatura cancelada: vale até ${formatDateBR(b.currentPeriodEnd)}`, tone: 'warn' }
      if (b.status === 'trialing') return { text: `Assinatura ativa: primeira cobrança em ${formatDateBR(b.trialEnd)}`, tone: 'ok' }
      return { text: `Assinatura ativa${b.currentPeriodEnd ? `, renova em ${formatDateBR(b.currentPeriodEnd)}` : ''}`, tone: 'ok' }
    case 'pix':
      return { text: `Pago por PIX até ${formatDateBR(b.currentPeriodEnd)}`, tone: 'ok' }
    case 'trial':
      return { text: `Teste grátis até ${formatDateBR(b.trialEnd)}`, tone: 'ok' }
    case 'legacy_courtesy':
      return { text: `Cortesia até ${formatDateBR(b.courtesyUntil)}`, tone: 'ok' }
    default:
      return { text: 'Sem assinatura', tone: 'muted' }
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
        <p className="text-sm text-muted-foreground">O plano da casa define quantas pessoas podem participar. Todos os planos têm todos os recursos, inclusive o site da casa.</p>
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
  const pix = useStartPixCheckout()
  const portal = useOpenBillingPortal()
  const methods = b.paymentMethods.length ? b.paymentMethods : (['card'] as PaymentMethod[])
  const [method, setMethod] = useState<PaymentMethod>(methods.includes('pix') && b.billingMode === 'pix' ? 'pix' : methods[0])
  const status = statusLabel(b)
  const limit = b.memberLimit
  const usagePct = limit ? Math.min(100, Math.round((b.activeMembers / limit) * 100)) : 0
  const busy = checkout.isPending || portal.isPending || pix.isPending
  // Cartão/boleto já valendo no Stripe (em dia ou atrasado): trocar plano/cartão e pagar fatura é pelo Portal.
  const stripeLive = b.hasActiveSubscription
  const canPay = (m: PaymentMethod) => !(stripeLive && m !== 'pix') && !(stripeLive && b.access === 'ok')
  const warnings = b.warnings.filter((w) => w.code !== 'payment_blocked')

  const pay = (planId: PlanCatalogItem['id']) => {
    if (method === 'pix') pix.mutate({ plan: planId, interval })
    else checkout.mutate({ plan: planId, interval, method })
  }

  return (
    <>
      {b.access === 'blocked' && b.canManage && (
        <section className="space-y-2 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200" data-testid="billing-blocked">
          <p className="flex items-center gap-2 font-semibold"><Lock className="size-4" /> Para voltar a usar, regularize o pagamento</p>
          <p className="text-sm">Nada foi apagado. Assim que o pagamento for confirmado, o acesso volta na hora para todo mundo da casa.</p>
        </section>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2" data-testid="billing-warnings">
          {warnings.map((w) => (
            <div key={w.code} className={cn('flex items-start gap-3 rounded-xl border p-3 text-sm', WARNING_STYLE[w.severity])} data-testid={`billing-warning-${w.code}`}>
              {w.severity === 'info' ? <Info className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
              <p>{w.message}</p>
            </div>
          ))}
        </div>
      )}

      <section className="grid gap-4 rounded-xl border bg-card p-4 sm:p-5 md:grid-cols-[1fr_1fr_auto] md:items-center" data-testid="billing-current">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{b.source === 'trial' ? 'Teste grátis' : 'Plano atual'}</p>
          <p className="text-2xl font-semibold" data-testid="billing-plan-name">{b.source === 'trial' ? `Teste grátis (${b.planName})` : b.planName}</p>
          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', TONE[status.tone])} data-testid="billing-status">
            {status.text}
          </span>
          {b.interval && (b.source === 'subscription' || b.source === 'pix') && (
            <p className="text-xs text-muted-foreground">
              {b.billingMode === 'pix' ? 'PIX' : 'Cobrança'} {b.interval === 'year' ? 'anual' : 'mensal'}
            </p>
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
          {b.canManage && b.lastInvoice?.hostedInvoiceUrl && b.access !== 'ok' && (
            <a href={b.lastInvoice.hostedInvoiceUrl} className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4" data-testid="billing-open-invoice">
              Pagar a fatura em aberto <ExternalLink className="size-3.5" />
            </a>
          )}
          {b.canManage && b.hasStripeCustomer && b.billingMode === 'stripe' && (
            <Button variant="outline" onClick={() => portal.mutate()} disabled={busy} data-testid="billing-portal">
              <CreditCard className="size-4" /> {portal.isPending ? 'Abrindo...' : 'Gerenciar assinatura'}
            </Button>
          )}
          {b.canManage && b.hasStripeCustomer && b.billingMode === 'stripe' && (
            <p className="max-w-56 text-xs text-muted-foreground md:text-right">Trocar plano ou cartão, pagar fatura, cancelar e ver as faturas.</p>
          )}
          {b.lastInvoice && (
            <p className="text-xs text-muted-foreground md:text-right" data-testid="billing-last-invoice">
              Último pagamento{b.lastInvoice.method === 'pix' ? ' (PIX)' : ''}: {formatBRL(b.lastInvoice.amountCents)} ({invoiceStatus(b.lastInvoice.status)}{b.lastInvoice.at ? ` em ${formatDateBR(b.lastInvoice.at)}` : ''})
            </p>
          )}
        </div>
      </section>

      {b.pendingPix && b.canManage && (
        <div className="flex items-start gap-3 rounded-xl border p-3 text-sm" data-testid="billing-pending-pix">
          <QrCode className="mt-0.5 size-4 shrink-0" />
          <p>
            PIX gerado para o plano {b.plans.find((p) => p.id === b.pendingPix!.plan)?.name} ({b.pendingPix.interval === 'year' ? 'anual' : 'mensal'}).
            Assim que o banco confirmar, o plano é atualizado aqui sozinho.
            {b.pendingPix.expiresAt ? ` Válido até ${new Date(b.pendingPix.expiresAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}.` : ''}
          </p>
        </div>
      )}

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

        {b.canManage && (
          <fieldset className="space-y-2" data-testid="billing-methods">
            <legend className="text-sm font-medium">Como a casa vai pagar</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {methods.map((m) => {
                const Icon = METHOD_INFO[m].icon
                const disabled = !canPay(m)
                return (
                  <label
                    key={m}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm',
                      method === m && 'border-primary ring-2 ring-primary/30',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                    data-testid={`billing-method-${m}`}
                  >
                    <input type="radio" name="method" value={m} className="sr-only" checked={method === m} disabled={disabled} onChange={() => setMethod(m)} />
                    <Icon className="mt-0.5 size-4 shrink-0" />
                    <span>
                      <span className="block font-medium">{METHOD_INFO[m].label}</span>
                      <span className="block text-xs text-muted-foreground">{METHOD_INFO[m].hint}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {b.plans.map((p) => (
            <PlanCard key={p.id} plan={p} b={b} interval={interval} method={method} busy={busy} canPay={canPay(method)} onPay={() => pay(p.id)} onPortal={() => portal.mutate()} />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {b.source === 'trial'
            ? `Durante o teste grátis nada é cobrado. Se assinar agora no cartão ou boleto, a primeira cobrança só acontece em ${formatDateBR(b.trialEnd)}; no PIX, o período pago começa quando o teste acabar.`
            : 'Pagamento processado pelo Stripe. '}
          {' '}Sem pagamento, a casa tem 15 dias para regularizar antes de o acesso ser suspenso. Nada é apagado.
        </p>
        {!b.canManage && (
          <p className="text-sm text-muted-foreground" data-testid="billing-readonly">Só a liderança da casa pode assinar ou mudar o plano.</p>
        )}
      </section>
    </>
  )
}

function invoiceStatus(s: string): string {
  return { paid: 'pago', failed: 'não pago', expired: 'PIX expirou', action_required: 'aguardando pagamento' }[s] ?? s
}

function PlanCard({
  plan,
  b,
  interval,
  method,
  busy,
  canPay,
  onPay,
  onPortal,
}: {
  plan: PlanCatalogItem
  b: HouseBilling
  interval: BillingInterval
  method: PaymentMethod
  busy: boolean
  canPay: boolean
  onPay: () => void
  onPortal: () => void
}) {
  const paying = b.source === 'subscription' || b.source === 'pix'
  const isCurrent = plan.id === b.plan && paying
  const price = interval === 'year' ? plan.yearlyCents : plan.monthlyCents
  const monthsFree = interval === 'year' ? Math.round((plan.monthlyCents * 12 - plan.yearlyCents) / plan.monthlyCents) : 0

  let action: React.ReactNode = null
  if (b.canManage) {
    if (b.hasActiveSubscription && b.access === 'ok' && method !== 'pix') {
      action = isCurrent
        ? <Button variant="outline" className="w-full" disabled>Seu plano</Button>
        : <Button variant="outline" className="w-full" onClick={onPortal} disabled={busy} data-testid={`billing-change-${plan.id}`}>Mudar para {plan.name}</Button>
    } else if (canPay) {
      const label = method === 'pix'
        ? `${b.billingMode === 'pix' && isCurrent ? 'Pagar o próximo período' : 'Pagar'} com PIX (${formatBRL(price)})`
        : b.access !== 'ok' ? `Regularizar com ${plan.name}` : `Assinar ${plan.name}`
      action = (
        <Button className="w-full" onClick={onPay} disabled={busy} data-testid={`billing-subscribe-${plan.id}`}>
          {method === 'pix' && <QrCode className="size-4" />} {label}
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
        <p className="text-2xl font-semibold" data-testid={`billing-price-${plan.id}`}>
          {formatBRL(price)}
          <span className="text-sm font-normal text-muted-foreground">/{interval === 'year' ? 'ano' : 'mês'}</span>
        </p>
        {monthsFree > 0 && <p className="text-xs text-muted-foreground">Equivale a {monthsFree} meses grátis no ano</p>}
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
