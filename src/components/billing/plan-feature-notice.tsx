'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useHouseBilling } from '@/hooks/use-billing'
import { ROUTES } from '@/constants'
import type { PlanFeature } from '@/services/billing'
import { buttonVariants } from '@/components/ui/button'

const LABELS: Record<PlanFeature, string> = {
  store: 'Cantina e loja',
  raffles: 'Rifas',
  campaigns: 'Campanhas',
  shoppingLists: 'Listas',
  publicOrders: 'Pedidos pelo site',
  push: 'Notificações no celular',
  permissions: 'Permissões por função',
}

/**
 * Convite para assinar no topo de uma tela de recurso pago, quando o plano da
 * casa não inclui o recurso. Os dados que já existem continuam na tela (só
 * leitura); o back recusa as escritas com a mesma explicação.
 */
export function PlanFeatureNotice({ feature, className }: { feature: PlanFeature; className?: string }) {
  const { data } = useHouseBilling()
  if (!data || data.features.includes(feature)) return null
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm sm:flex-row sm:items-center ${className ?? ''}`}
      data-testid={`plan-feature-notice-${feature}`}
    >
      <Sparkles className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{LABELS[feature]} faz parte do plano Casa</p>
        <p className="text-muted-foreground">
          Sua casa está no plano {data.planName}. O que já foi cadastrado continua aqui, só para leitura.
          {data.canManage ? ' Assine para voltar a criar e editar.' : ' A liderança da casa pode assinar um plano.'}
        </p>
      </div>
      {data.canManage && (
        <Link href={ROUTES.ADMIN_BILLING} className={buttonVariants({ size: 'sm', className: 'shrink-0' })}>
          Ver planos
        </Link>
      )}
    </div>
  )
}
