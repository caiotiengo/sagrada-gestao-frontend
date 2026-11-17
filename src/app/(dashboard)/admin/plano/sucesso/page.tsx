'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock } from 'lucide-react'
import { useHouseBilling } from '@/hooks/use-billing'
import { ROUTES } from '@/constants'
import { buttonVariants } from '@/components/ui/button'

/** Até onde esperar o webhook confirmar a assinatura antes de mostrar "aguardando". */
const MAX_WAIT_MS = 60_000

/**
 * Volta do Stripe Checkout. Quem ativa o plano é o webhook (não esta página):
 * aqui só esperamos ele chegar, consultando o plano a cada 3 s.
 */
export default function BillingSuccessPage() {
  return (
    <Suspense>
      <BillingSuccess />
    </Suspense>
  )
}

function BillingSuccess() {
  const qc = useQueryClient()
  const [startedAt] = useState(() => Date.now())
  const [waitedTooLong, setWaitedTooLong] = useState(false)
  const billing = useHouseBilling({ refetchInterval: waitedTooLong ? false : 3000 })
  const isPix = useSearchParams().get('pix') === '1'
  const d = billing.data
  // PIX: confirmado quando o período pago por PIX está valendo (e sem PIX pendente).
  const active = !!d && d.access === 'ok' && (isPix ? d.source === 'pix' && !d.pendingPix : d.source === 'subscription')

  useEffect(() => {
    const t = setTimeout(() => setWaitedTooLong(true), Math.max(0, MAX_WAIT_MS - (Date.now() - startedAt)))
    return () => clearTimeout(t)
  }, [startedAt])

  useEffect(() => {
    // O plano muda o que as outras telas mostram (avisos, recursos).
    if (active) qc.invalidateQueries({ queryKey: ['house'] })
  }, [active, qc])

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-12 text-center" data-testid="billing-success">
      {active ? (
        <>
          <CheckCircle2 className="size-12 text-emerald-600" />
          <h1 className="text-2xl font-semibold">Assinatura confirmada</h1>
          <p className="text-muted-foreground" data-testid="billing-success-plan">
            Sua casa está no plano <strong>{d!.planName}</strong>. Tudo liberado.
          </p>
        </>
      ) : (
        <>
          <Clock className="size-12 text-primary" />
          <h1 className="text-2xl font-semibold">{isPix ? 'Aguardando a confirmação do PIX' : 'Pagamento recebido pelo Stripe'}</h1>
          <p className="text-muted-foreground" data-testid="billing-success-waiting">
            {isPix
              ? 'Assim que o banco confirmar o PIX, o plano é atualizado aqui sozinho (normalmente em segundos). Se ainda não pagou, use o QR ou o copia-e-cola na página do Stripe.'
              : waitedTooLong
              ? 'A confirmação ainda não chegou. Se você pagou com boleto, o plano é ativado quando o banco confirmar (até 1 dia útil). Você pode fechar esta página.'
              : 'Estamos ativando o plano da casa. Isso leva alguns segundos...'}
          </p>
        </>
      )}
      <Link href={ROUTES.ADMIN_BILLING} className={buttonVariants({ variant: 'outline' })}>
        Ver plano e cobrança
      </Link>
    </div>
  )
}
