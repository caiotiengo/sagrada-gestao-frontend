'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertTriangle, Info, Lock, X } from 'lucide-react'
import { useHouseBilling } from '@/hooks/use-billing'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import type { BillingWarning } from '@/services/billing'

const STYLE: Record<BillingWarning['severity'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
  danger: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200',
}

/** Dia de hoje em Brasília (o aviso dispensado volta no dia seguinte). */
function todayBRT(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

const dismissKey = (houseId: string) => `sg:billing-pending-dismissed:${houseId}`

function readDismissed(houseId: string): boolean {
  try {
    return localStorage.getItem(dismissKey(houseId)) === todayBRT() || sessionStorage.getItem(dismissKey(houseId)) === '1'
  } catch {
    return false
  }
}

function writeDismissed(houseId: string) {
  try {
    localStorage.setItem(dismissKey(houseId), todayBRT())
    sessionStorage.setItem(dismissKey(houseId), '1')
  } catch {
    /* navegador sem storage: some só nesta tela */
  }
}

/**
 * Avisos da assinatura no topo da Gestão (só para quem gerencia a casa).
 *  - Casa BLOQUEADA: banner fixo, não dispensável, em todas as telas.
 *  - Pagamento pendente (dias 1..15): aviso dispensável por hoje/sessão; volta no dia seguinte.
 *  - Demais avisos (cortesia, fim do teste, limite): fora da página do plano.
 */
export function BillingAlerts() {
  const pathname = usePathname()
  const { data } = useHouseBilling()
  // Casa para a qual o aviso foi dispensado agora (o resto vem do storage: hoje/sessão).
  const [dismissedNow, setDismissedNow] = useState<string | null>(null)
  const houseId = data?.houseId
  const dismissed = !!houseId && (dismissedNow === houseId || readDismissed(houseId))

  if (!data?.canManage) return null

  if (data.access === 'blocked') {
    return (
      <div className="px-4 pt-4 lg:px-8" data-testid="billing-blocked-banner" role="alert">
        <div className={cn('flex items-start gap-3 rounded-xl border p-3 text-sm', STYLE.danger)}>
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p className="min-w-0 flex-1 font-medium">Pagamento pendente: o acesso da casa está suspenso. Regularize para voltar a usar.</p>
          {!pathname.startsWith(ROUTES.ADMIN_BILLING) && (
            <Link href={ROUTES.ADMIN_BILLING} className="shrink-0 font-medium underline underline-offset-4">Regularizar</Link>
          )}
        </div>
      </div>
    )
  }

  const onBillingPage = pathname.startsWith(ROUTES.ADMIN_BILLING)
  const pending = data.warnings.find((w) => w.code === 'payment_pending')
  const others = onBillingPage
    ? []
    : data.warnings.filter((w) => w.code !== 'payment_pending' && (w.code !== 'near_member_limit' || w.severity !== 'info'))
  const showPending = !!pending && !dismissed && !onBillingPage
  if (!showPending && others.length === 0) return null

  return (
    <div className="space-y-2 px-4 pt-4 lg:px-8" data-testid="billing-alerts">
      {showPending && pending && (
        <div className={cn('flex items-start gap-3 rounded-xl border p-3 text-sm', STYLE.danger)} data-testid="billing-alert-payment_pending" role="status">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p className="min-w-0 flex-1">{pending.message}</p>
          <Link href={ROUTES.ADMIN_BILLING} className="shrink-0 font-medium underline underline-offset-4">Regularizar</Link>
          <button
            type="button"
            aria-label="Dispensar aviso por hoje"
            className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
            onClick={() => {
              writeDismissed(data.houseId)
              setDismissedNow(data.houseId)
            }}
            data-testid="billing-alert-dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      {others.map((w) => (
        <div key={w.code} className={cn('flex items-start gap-3 rounded-xl border p-3 text-sm', STYLE[w.severity])} data-testid={`billing-alert-${w.code}`}>
          {w.severity === 'info' ? <Info className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
          <p className="min-w-0 flex-1">{w.message}</p>
          <Link href={ROUTES.ADMIN_BILLING} className="shrink-0 font-medium underline underline-offset-4">
            Plano e cobrança
          </Link>
        </div>
      ))}
    </div>
  )
}
