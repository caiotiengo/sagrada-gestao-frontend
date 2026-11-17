'use client'

import { useState } from 'react'
import { Check, Pencil, RotateCcw, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useApproveReceipt, useReceiptDetail, useRejectReceipt } from '@/hooks/use-receipts'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/utils/dates'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencyInput } from '@/components/forms/currency-input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ReceiptOpenItem, ReceiptView } from '@/types/receipts'
import {
  AppliedLines,
  centsToBRL,
  isInReview,
  isSettled,
  ReceiptChecksList,
  ReceiptFacts,
  ReceiptFilePreview,
  ReceiptStatusBadge,
} from './receipt-parts'

type Mode = 'view' | 'adjust' | 'reject'

const STRATEGY: Record<string, string> = {
  exact: 'valor exato de um item',
  combination: 'soma exata de itens',
  fifo: 'do mais antigo para o mais novo',
  none: 'nenhum item em aberto coube',
  manual: 'ajustada à mão',
}

interface Props {
  receiptId: string | null
  onClose: () => void
  /** Histórico: botão "Desfazer baixa" abre a confirmação da página. */
  onReverse?: (r: ReceiptView) => void
}

/** Detalhe do comprovante: arquivo, dados lidos, conferências e as ações do caixa. */
export function ReceiptReviewDialog({ receiptId, onClose, onReverse }: Props) {
  const detail = useReceiptDetail(receiptId)
  const r = detail.data?.receipt
  const [mode, setMode] = useState<Mode>('view')

  const close = () => {
    setMode('view')
    onClose()
  }

  return (
    <Dialog open={!!receiptId} onOpenChange={(v) => { if (!v) close() }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-4xl" data-testid="receipt-dialog">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-8">
            Comprovante {r?.memberName ? `de ${r.memberName}` : ''}
            {r && <ReceiptStatusBadge status={r.status} />}
          </DialogTitle>
          <DialogDescription>
            {r ? `Enviado em ${formatDateTime(r.createdAt)}${r.amountCents != null ? ` · ${centsToBRL(r.amountCents)}` : ''}` : 'Carregando…'}
          </DialogDescription>
        </DialogHeader>

        {detail.isLoading || !r ? (
          detail.isError ? (
            <p role="alert" className="text-sm text-destructive">{getErrorMessage(detail.error, 'Não foi possível abrir o comprovante.')}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-72 rounded-lg" />
              <Skeleton className="h-72 rounded-lg" />
            </div>
          )
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Arquivo enviado</h3>
              <ReceiptFilePreview receipt={r} />
            </div>

            <div className="space-y-5">
              <section aria-labelledby="rc-facts">
                <h3 id="rc-facts" className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">O que foi lido</h3>
                <ReceiptFacts r={r} />
              </section>

              <section aria-labelledby="rc-checks">
                <h3 id="rc-checks" className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conferências</h3>
                <ReceiptChecksList checks={r.checks} />
              </section>

              {mode === 'view' && (
                <ViewSection r={r} onAdjust={() => setMode('adjust')} onReject={() => setMode('reject')} onDone={close} onReverse={onReverse} />
              )}
              {mode === 'adjust' && (
                <AdjustSection r={r} openItems={detail.data?.openItems ?? []} onCancel={() => setMode('view')} onDone={close} />
              )}
              {mode === 'reject' && <RejectSection r={r} onCancel={() => setMode('view')} onDone={close} />}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ViewSection({
  r,
  onAdjust,
  onReject,
  onDone,
  onReverse,
}: {
  r: ReceiptView
  onAdjust: () => void
  onReject: () => void
  onDone: () => void
  onReverse?: (r: ReceiptView) => void
}) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const approve = useApproveReceipt()
  const s = r.suggestion

  if (isInReview(r.status)) {
    return (
      <>
        <section aria-labelledby="rc-sugg">
          <h3 id="rc-sugg" className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Baixa sugerida</h3>
          {s && s.lines.length > 0 ? (
            <div className="space-y-1.5 rounded-lg border p-3" data-testid="receipt-suggestion">
              <AppliedLines lines={s.lines} />
              <p className="border-t pt-1.5 text-xs text-muted-foreground">
                Como foi escolhida: {STRATEGY[s.strategy] ?? s.strategy}.
                {s.leftoverCents > 0 && <> Sobra de {centsToBRL(s.leftoverCents)} (não vira crédito sozinha).</>}
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Nenhum item em aberto bate com o valor. Use &quot;Ajustar&quot; para escolher os itens.
            </p>
          )}
        </section>
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            onClick={() => houseId && approve.mutate({ houseId, receiptId: r.id }, { onSuccess: onDone })}
            disabled={approve.isPending || !s || s.lines.length === 0}
            data-testid="receipt-approve"
          >
            <Check className="size-4" aria-hidden />
            {approve.isPending ? 'Aprovando…' : 'Aprovar'}
          </Button>
          <Button variant="outline" onClick={onAdjust} data-testid="receipt-adjust">
            <Pencil className="size-4" aria-hidden /> Ajustar
          </Button>
          <Button variant="destructive" onClick={onReject} data-testid="receipt-reject">
            <X className="size-4" aria-hidden /> Recusar
          </Button>
        </div>
      </>
    )
  }

  return (
    <section aria-labelledby="rc-result" className="space-y-2">
      <h3 id="rc-result" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado</h3>
      {(isSettled(r.status) || r.status === 'reversed') && r.applied.length > 0 && (
        <div className="rounded-lg border p-3">
          <AppliedLines lines={r.applied} />
        </div>
      )}
      {r.decision && (
        <p className="text-sm text-muted-foreground">
          {r.decision.mode === 'auto' ? 'Decisão automática' : r.decision.adjusted ? 'Aprovado com ajuste' : 'Decisão manual'}
          {r.decision.at ? ` em ${formatDateTime(r.decision.at)}` : ''}.
        </p>
      )}
      {r.leftoverCents > 0 && isSettled(r.status) && <p className="text-sm">Sobra de {centsToBRL(r.leftoverCents)}.</p>}
      {r.rejectionReason && <p className="text-sm">Motivo da recusa: {r.rejectionReason}</p>}
      {r.reversal && (
        <p className="text-sm">
          Baixa desfeita{r.reversal.at ? ` em ${formatDateTime(r.reversal.at)}` : ''}: {r.reversal.reason}
        </p>
      )}
      {r.note && <p className="text-sm">Observação: {r.note}</p>}
      {isSettled(r.status) && onReverse && (
        <div className="border-t pt-4">
          <Button variant="destructive" onClick={() => onReverse(r)} data-testid="receipt-reverse-open">
            <RotateCcw className="size-4" aria-hidden /> Desfazer baixa
          </Button>
        </div>
      )}
    </section>
  )
}

interface ItemPick {
  checked: boolean
  cents: number
}

function AdjustSection({
  r,
  openItems,
  onCancel,
  onDone,
}: {
  r: ReceiptView
  openItems: ReceiptOpenItem[]
  onCancel: () => void
  onDone: () => void
}) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const approve = useApproveReceipt()
  const [amount, setAmount] = useState((r.amountCents ?? 0) / 100)
  const [note, setNote] = useState('')
  const [picks, setPicks] = useState<Record<string, ItemPick>>(() => {
    const init: Record<string, ItemPick> = {}
    for (const l of r.suggestion?.lines ?? []) init[`${l.type}:${l.id}`] = { checked: true, cents: l.appliedCents }
    return init
  })

  const amountCents = Math.round(amount * 100)
  const chosen = openItems.filter((i) => picks[`${i.type}:${i.id}`]?.checked)
  const total = chosen.reduce((sum, i) => sum + (picks[`${i.type}:${i.id}`]?.cents ?? 0), 0)
  const invalidPart = chosen.find((i) => {
    const c = picks[`${i.type}:${i.id}`]?.cents ?? 0
    return c <= 0 || c > i.openCents
  })
  const error =
    amountCents <= 0
      ? 'Informe o valor do comprovante.'
      : invalidPart
        ? `Valor de "${invalidPart.description}" precisa ficar entre R$ 0,01 e ${centsToBRL(invalidPart.openCents)}.`
        : total > amountCents
          ? 'Os itens marcados passam do valor do comprovante.'
          : null

  const toggle = (i: ReceiptOpenItem, checked: boolean) =>
    setPicks((p) => ({ ...p, [`${i.type}:${i.id}`]: { checked, cents: p[`${i.type}:${i.id}`]?.cents || i.openCents } }))

  const submit = () => {
    if (!houseId || error) return
    approve.mutate(
      {
        houseId,
        receiptId: r.id,
        amountCents,
        ...(chosen.length > 0
          ? { items: chosen.map((i) => ({ type: i.type, id: i.id, amountCents: picks[`${i.type}:${i.id}`].cents })) }
          : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      },
      { onSuccess: onDone },
    )
  }

  return (
    <section aria-labelledby="rc-adjust" className="space-y-4 rounded-lg border p-3" data-testid="receipt-adjust-form">
      <h3 id="rc-adjust" className="text-sm font-semibold">Ajustar a baixa</h3>
      <div className="space-y-1.5">
        <Label htmlFor="rc-amount">Valor do comprovante (R$)</Label>
        <CurrencyInput id="rc-amount" value={amount} onValueChange={setAmount} className="max-w-48" />
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">Itens em aberto de {r.memberName ?? 'quem enviou'}</legend>
        {openItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada em aberto. Aprovar só registra o valor como sobra.</p>
        ) : (
          openItems.map((i) => {
            const key = `${i.type}:${i.id}`
            const p = picks[key]
            const id = `rc-item-${i.id}`
            return (
              <div key={key} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border p-2">
                <label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm">
                  <Checkbox id={id} checked={!!p?.checked} onCheckedChange={(v) => toggle(i, !!v)} />
                  <span className="min-w-0">
                    {i.description}
                    <span className="block text-xs text-muted-foreground">
                      Em aberto: {centsToBRL(i.openCents)}{i.partialAllowed ? ' · aceita parte' : ' · só inteiro'}
                    </span>
                  </span>
                </label>
                {p?.checked && i.partialAllowed && (
                  <CurrencyInput
                    aria-label={`Valor para ${i.description}`}
                    value={(p.cents ?? 0) / 100}
                    onValueChange={(v) => setPicks((x) => ({ ...x, [key]: { checked: true, cents: Math.round(v * 100) } }))}
                    className="h-8 w-32"
                  />
                )}
                {p?.checked && !i.partialAllowed && <span className="text-sm font-medium tabular-nums">{centsToBRL(i.openCents)}</span>}
              </div>
            )
          })
        )}
      </fieldset>
      <p className="text-sm" aria-live="polite">
        Marcado: <strong className="tabular-nums">{centsToBRL(total)}</strong> de {centsToBRL(amountCents)}
        {amountCents > total && <> · sobra {centsToBRL(amountCents - total)}</>}
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="rc-note">Observação (opcional)</Label>
        <Textarea id="rc-note" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} disabled={!!error || approve.isPending} data-testid="receipt-adjust-confirm">
          <Check className="size-4" aria-hidden /> {approve.isPending ? 'Aprovando…' : 'Aprovar com ajuste'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Voltar</Button>
      </div>
    </section>
  )
}

function RejectSection({ r, onCancel, onDone }: { r: ReceiptView; onCancel: () => void; onDone: () => void }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const reject = useRejectReceipt()
  const [reason, setReason] = useState('')
  const valid = reason.trim().length >= 3
  return (
    <section aria-labelledby="rc-reject" className="space-y-3 rounded-lg border border-destructive/40 p-3">
      <h3 id="rc-reject" className="text-sm font-semibold">Recusar comprovante</h3>
      <div className="space-y-1.5">
        <Label htmlFor="rc-reason">Motivo (o filho vai ver)</Label>
        <Textarea
          id="rc-reason"
          rows={2}
          maxLength={300}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex.: o PIX foi para outra conta"
          aria-describedby="rc-reason-hint"
          data-testid="receipt-reject-reason"
        />
        <p id="rc-reason-hint" className="text-xs text-muted-foreground">Mínimo de 3 letras.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          disabled={!valid || reject.isPending}
          onClick={() => houseId && reject.mutate({ houseId, receiptId: r.id, reason: reason.trim() }, { onSuccess: onDone })}
          data-testid="receipt-reject-confirm"
        >
          {reject.isPending ? 'Recusando…' : 'Recusar'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Voltar</Button>
      </div>
    </section>
  )
}
