'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertTriangle, Info } from 'lucide-react'
import { useHouseBilling } from '@/hooks/use-billing'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import type { BillingWarning } from '@/services/billing'

const STYLE: Record<BillingWarning['severity'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
  danger: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200',
}

/**
 * Avisos da assinatura no topo da Gestão (pagamento atrasado, cortesia,
 * limite de pessoas, cancelamento agendado). Só para quem gerencia a casa;
 * a própria página do plano já mostra tudo.
 */
export function BillingAlerts() {
  const pathname = usePathname()
  const { data } = useHouseBilling()
  if (!data?.canManage || pathname.startsWith(ROUTES.ADMIN_BILLING)) return null
  const shown = data.warnings.filter((w) => w.code !== 'near_member_limit' || w.severity !== 'info')
  if (shown.length === 0) return null
  return (
    <div className="space-y-2 px-4 pt-4 lg:px-8" data-testid="billing-alerts">
      {shown.map((w) => (
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
