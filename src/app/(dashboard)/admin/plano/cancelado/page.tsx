'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { ROUTES } from '@/constants'
import { buttonVariants } from '@/components/ui/button'

/** Volta do Stripe Checkout sem pagar. Nada foi cobrado nem mudou. */
export default function BillingCanceledPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-12 text-center" data-testid="billing-canceled">
      <XCircle className="size-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Assinatura não concluída</h1>
      <p className="text-muted-foreground">Nada foi cobrado e o plano da casa continua o mesmo. Você pode tentar de novo quando quiser.</p>
      <Link href={ROUTES.ADMIN_BILLING} className={buttonVariants()}>
        Voltar para os planos
      </Link>
    </div>
  )
}
