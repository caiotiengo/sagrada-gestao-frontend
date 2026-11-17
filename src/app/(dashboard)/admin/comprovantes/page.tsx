'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Eye, Inbox, Receipt, RotateCcw, Settings2, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import {
  useHouseReceipts,
  useReceiptSettings,
  useReverseReceipt,
  useUpdateReceiptSettings,
} from '@/hooks/use-receipts'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/utils/dates'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CurrencyInput } from '@/components/forms/currency-input'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ReceiptReviewDialog } from '@/components/receipts/receipt-review-dialog'
import {
  AppliedLines,
  centsToBRL,
  isSettled,
  ReceiptStatusBadge,
} from '@/components/receipts/receipt-parts'
import type { ReceiptListFilter, ReceiptSettings, ReceiptView } from '@/types/receipts'

const HISTORY_FILTERS: { value: ReceiptListFilter; label: string }[] = [
  { value: 'settled', label: 'Baixas' },
  { value: 'reversed', label: 'Desfeitas' },
  { value: 'rejected', label: 'Recusadas' },
  { value: 'all', label: 'Todos' },
]

export default function AdminReceiptsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const [tab, setTab] = useState<'review' | 'history'>('review')
  const [historyFilter, setHistoryFilter] = useState<ReceiptListFilter>('settled')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reversing, setReversing] = useState<ReceiptView | null>(null)

  const review = useHouseReceipts('review')
  const history = useHouseReceipts(historyFilter, tab === 'history')
  const pending = review.data?.pendingReviewCount ?? 0

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Comprovantes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comprovantes de PIX enviados pelos filhos. Quando tudo confere, a baixa é automática; o resto espera você aqui.
        </p>
      </div>

      <SettingsCard canEdit={isAdmin} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'review' | 'history')}>
        <TabsList>
          <TabsTrigger value="review" data-testid="tab-review">
            Para conferir{pending > 0 ? ` (${pending})` : ''}
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-3 pt-2">
          {review.isLoading ? (
            <ListLoading />
          ) : review.isError ? (
            <ErrorState message={getErrorMessage(review.error, 'Não foi possível carregar os comprovantes')} onRetry={() => review.refetch()} />
          ) : (review.data?.receipts ?? []).length === 0 ? (
            <EmptyState icon={Inbox} title="Nada para conferir" description="Quando um comprovante precisar de você, ele aparece aqui." className="min-h-[24dvh]" />
          ) : (
            <ul className="space-y-2" aria-label="Comprovantes para conferir">
              {review.data!.receipts.map((r) => (
                <li key={r.id}>
                  <ReviewCard r={r} onOpen={() => setOpenId(r.id)} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 pt-2">
          <div role="group" aria-label="Filtrar histórico" className="flex flex-wrap gap-1.5">
            {HISTORY_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={historyFilter === f.value ? 'default' : 'outline'}
                aria-pressed={historyFilter === f.value}
                onClick={() => setHistoryFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          {history.isLoading ? (
            <ListLoading />
          ) : history.isError ? (
            <ErrorState message={getErrorMessage(history.error, 'Não foi possível carregar o histórico')} onRetry={() => history.refetch()} />
          ) : (history.data?.receipts ?? []).length === 0 ? (
            <EmptyState icon={Receipt} title="Nada por aqui" description="Nenhum comprovante neste filtro." className="min-h-[24dvh]" />
          ) : (
            <ul className="space-y-2" aria-label="Histórico de comprovantes">
              {history.data!.receipts.map((r) => (
                <li key={r.id}>
                  <HistoryCard r={r} onOpen={() => setOpenId(r.id)} onReverse={() => setReversing(r)} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <ReceiptReviewDialog
        receiptId={openId}
        onClose={() => setOpenId(null)}
        onReverse={(r) => {
          setOpenId(null)
          setReversing(r)
        }}
      />
      <ReverseDialog receipt={reversing} onClose={() => setReversing(null)} />
    </div>
  )
}

function ListLoading() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  )
}

function ReviewCard({ r, onOpen }: { r: ReceiptView; onOpen: () => void }) {
  const fails = r.checks.filter((c) => c.status === 'fail')
  const warns = r.checks.filter((c) => c.status === 'warn')
  const main = fails[0] ?? warns[0]
  return (
    <Card className="rounded-xl" data-testid="review-card" data-receipt-id={r.id}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{r.memberName ?? 'Membro'}</span>
            <ReceiptStatusBadge status={r.status} />
            <span className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</span>
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {fails.length > 0 && (
              <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400">
                <XCircle className="size-3.5" aria-hidden /> {fails.length} {fails.length === 1 ? 'falha' : 'falhas'}
              </span>
            )}
            {warns.length > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-3.5" aria-hidden /> {warns.length} {warns.length === 1 ? 'atenção' : 'atenções'}
              </span>
            )}
            {fails.length === 0 && warns.length === 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" aria-hidden /> conferências ok
              </span>
            )}
          </p>
          {main && <p className="text-sm text-muted-foreground">{main.message}</p>}
        </div>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="text-base font-semibold tabular-nums">{r.amountCents != null ? centsToBRL(r.amountCents) : '—'}</span>
          <Button size="sm" onClick={onOpen} aria-label={`Conferir comprovante de ${r.memberName ?? 'membro'}`}>
            <Eye className="size-4" aria-hidden /> Conferir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryCard({ r, onOpen, onReverse }: { r: ReceiptView; onOpen: () => void; onReverse: () => void }) {
  const who = r.memberName ?? 'membro'
  return (
    <Card className="rounded-xl" data-testid="history-card" data-receipt-id={r.id} data-status={r.status}>
      <CardContent className="space-y-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{r.memberName ?? 'Membro'}</span>
            <ReceiptStatusBadge status={r.status} />
            <span className="text-xs text-muted-foreground">
              {isSettled(r.status)
                ? `Baixa em ${formatDateTime(r.decision?.at ?? r.createdAt)}${r.decision?.mode === 'auto' ? ' (automática)' : ''}`
                : `Enviado em ${formatDateTime(r.createdAt)}`}
            </span>
          </div>
          <span className="font-semibold tabular-nums">{r.amountCents != null ? centsToBRL(r.amountCents) : '—'}</span>
        </div>
        {r.applied.length > 0 && <AppliedLines lines={r.applied} className={r.status === 'reversed' ? 'text-muted-foreground line-through' : ''} />}
        {r.status === 'rejected' && r.rejectionReason && <p className="text-sm">Motivo: {r.rejectionReason}</p>}
        {r.status === 'reversed' && r.reversal && <p className="text-sm">Desfeita: {r.reversal.reason}</p>}
        {isSettled(r.status) && r.leftoverCents > 0 && <p className="text-xs text-muted-foreground">Sobra de {centsToBRL(r.leftoverCents)}.</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={onOpen} aria-label={`Ver comprovante de ${who}`}>
            <Eye className="size-4" aria-hidden /> Ver comprovante
          </Button>
          {isSettled(r.status) && (
            <Button size="sm" variant="destructive" onClick={onReverse} aria-label={`Desfazer baixa do comprovante de ${who}`} data-testid="history-reverse">
              <RotateCcw className="size-4" aria-hidden /> Desfazer baixa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ReverseDialog({ receipt, onClose }: { receipt: ReceiptView | null; onClose: () => void }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const reverse = useReverseReceipt()
  const [reason, setReason] = useState('')
  const valid = reason.trim().length >= 3
  const close = () => {
    setReason('')
    onClose()
  }
  return (
    <Dialog open={!!receipt} onOpenChange={(v) => { if (!v) close() }}>
      <DialogContent className="sm:max-w-md" data-testid="reverse-dialog">
        <DialogHeader>
          <DialogTitle>Desfazer baixa?</DialogTitle>
          <DialogDescription>
            {receipt &&
              `${receipt.memberName ?? 'Membro'} · ${centsToBRL(receipt.amountCents)}. Os itens voltam a ficar em aberto para o filho e o extrato ganha um estorno. O filho recebe um aviso.`}
          </DialogDescription>
        </DialogHeader>
        {receipt && receipt.applied.length > 0 && (
          <div className="rounded-lg border p-3">
            <AppliedLines lines={receipt.applied} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="reverse-reason">Motivo</Label>
          <Textarea
            id="reverse-reason"
            rows={2}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: comprovante de outro mês"
            aria-describedby="reverse-hint"
            data-testid="reverse-reason"
          />
          <p id="reverse-hint" className="text-xs text-muted-foreground">Mínimo de 3 letras. O filho vai ver o motivo.</p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Voltar</DialogClose>
          <Button
            variant="destructive"
            disabled={!valid || reverse.isPending}
            onClick={() =>
              houseId && receipt && reverse.mutate({ houseId, receiptId: receipt.id, reason: reason.trim() }, { onSuccess: close })
            }
            data-testid="reverse-confirm"
          >
            {reverse.isPending ? 'Desfazendo…' : 'Desfazer baixa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SettingsCard({ canEdit }: { canEdit: boolean }) {
  const settings = useReceiptSettings()
  if (settings.isLoading) return <Skeleton className="h-16 w-full rounded-xl" />
  if (settings.isError || !settings.data) return null
  const s = settings.data
  const summary =
    s.mode === 'review'
      ? 'Sempre conferir: todo comprovante espera a conferência.'
      : `Automático: dá baixa sozinho quando tudo confere, até ${centsToBRL(s.maxAutoAmountCents)} por comprovante.`
  return (
    <Card className="rounded-xl" data-testid="receipt-settings">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="size-4 text-muted-foreground" aria-hidden /> Baixa automática
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground" data-testid="receipt-settings-summary">{summary}</p>
            {!s.autoReadAvailable && (
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                O plano da casa não tem leitura automática: todo comprovante cai na conferência.
              </p>
            )}
          </div>
        </div>
        {canEdit && <SettingsForm key={`${s.mode}:${s.maxAutoAmountCents}`} s={s} />}
      </CardContent>
    </Card>
  )
}

function SettingsForm({ s }: { s: ReceiptSettings }) {
  const houseId = useAuthStore((st) => st.currentHouseId())
  const update = useUpdateReceiptSettings()
  const [mode, setMode] = useState<'auto' | 'review'>(s.mode)
  const [cap, setCap] = useState(s.maxAutoAmountCents / 100)
  const changed = mode !== s.mode || Math.round(cap * 100) !== s.maxAutoAmountCents
  return (
    <form
      className="space-y-3 border-t pt-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (houseId) update.mutate({ houseId, mode, maxAutoAmountCents: Math.round(cap * 100) })
      }}
    >
      <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'auto' | 'review')} aria-label="Como dar baixa" className="sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm">
          <RadioGroupItem value="auto" className="mt-0.5" />
          <span>
            <span className="font-medium">Automático</span>
            <span className="block text-xs text-muted-foreground">Baixa na hora quando tudo confere.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm">
          <RadioGroupItem value="review" className="mt-0.5" />
          <span>
            <span className="font-medium">Sempre conferir</span>
            <span className="block text-xs text-muted-foreground">Todo comprovante espera a Liderança.</span>
          </span>
        </label>
      </RadioGroup>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="receipt-cap">Teto da baixa automática (R$)</Label>
          <CurrencyInput id="receipt-cap" value={cap} onValueChange={setCap} disabled={mode === 'review'} className="w-40" aria-describedby="receipt-cap-hint" />
        </div>
        <Button type="submit" disabled={!changed || update.isPending}>
          {update.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
      <p id="receipt-cap-hint" className="text-xs text-muted-foreground">
        Acima do teto o comprovante vai para a conferência. Padrão: {centsToBRL(s.defaults.maxAutoAmountCents)}.
      </p>
    </form>
  )
}
