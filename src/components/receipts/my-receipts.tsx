'use client'

import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { useMyReceipts } from '@/hooks/use-receipts'
import { formatDateTime } from '@/utils/dates'
import { getErrorMessage } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { AppliedLines, centsToBRL, isSettled, receiptResultText, ReceiptStatusBadge } from './receipt-parts'

const FIRST = 5

/** "Meus comprovantes": status de cada envio e os itens quitados. */
export function MyReceipts() {
  const { data, isLoading, isError, error, refetch } = useMyReceipts(50)
  const [showAll, setShowAll] = useState(false)
  const receipts = data?.receipts ?? []
  const visible = showAll ? receipts : receipts.slice(0, FIRST)

  return (
    <section aria-labelledby="my-receipts-title" className="space-y-3" data-testid="my-receipts">
      <h2 id="my-receipts-title" className="flex items-center gap-2 text-sm font-semibold">
        <Receipt className="size-4 text-muted-foreground" aria-hidden />
        Meus comprovantes
      </h2>
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : isError ? (
        <ErrorState title="Erro ao carregar comprovantes" message={getErrorMessage(error, 'Tente de novo.')} onRetry={() => refetch()} />
      ) : receipts.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Você ainda não enviou nenhum comprovante.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {visible.map((r) => (
              <li key={r.id}>
                <Card className="rounded-xl" data-testid="my-receipt" data-status={r.status}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <ReceiptStatusBadge status={r.status} />
                        <span className="text-xs text-muted-foreground">Enviado em {formatDateTime(r.createdAt)}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {r.amountCents != null ? centsToBRL(r.amountCents) : '—'}
                      </span>
                    </div>
                    {isSettled(r.status) ? (
                      <>
                        <p className="text-sm">
                          Pago — baixa feita em {r.decision?.at ? formatDateTime(r.decision.at) : formatDateTime(r.createdAt)}:
                        </p>
                        <AppliedLines lines={r.applied} />
                        {r.leftoverCents > 0 && (
                          <p className="text-xs text-muted-foreground">Sobrou {centsToBRL(r.leftoverCents)}: a Liderança vai combinar com você.</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm">{receiptResultText(r)}</p>
                    )}
                    {r.status === 'reversed' && r.applied.length > 0 && (
                      <p className="text-xs text-muted-foreground">Os itens voltaram a ficar em aberto.</p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          {receipts.length > FIRST && (
            <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
              {showAll ? 'Mostrar menos' : `Ver todos (${receipts.length})`}
            </Button>
          )}
        </>
      )}
    </section>
  )
}
