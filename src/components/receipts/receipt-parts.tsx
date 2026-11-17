'use client'

import { useEffect, useMemo } from 'react'
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, FileText, MinusCircle, RotateCcw, XCircle } from 'lucide-react'
import { useReceiptFile } from '@/hooks/use-receipts'
import { formatCurrency } from '@/utils'
import { formatDateTime } from '@/utils/dates'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReceiptCheck, ReceiptLine, ReceiptStatus, ReceiptView } from '@/types/receipts'

export const centsToBRL = (cents: number | null | undefined) => formatCurrency((cents ?? 0) / 100)

export const isSettled = (s: ReceiptStatus) => s === 'auto_approved' || s === 'approved'
export const isInReview = (s: ReceiptStatus) => s === 'pending_review' || s === 'processing'

const STATUS: Record<ReceiptStatus, { label: string; className: string; icon: React.ElementType }> = {
  processing: {
    label: 'Lendo',
    className: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
    icon: Clock,
  },
  pending_review: {
    label: 'Em conferência',
    className: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
    icon: Clock,
  },
  auto_approved: {
    label: 'Pago',
    className: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  approved: {
    label: 'Pago',
    className: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Recusado',
    className: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
    icon: XCircle,
  },
  reversed: {
    label: 'Baixa desfeita',
    className: 'border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
    icon: RotateCcw,
  },
}

export function ReceiptStatusBadge({ status, className }: { status: ReceiptStatus; className?: string }) {
  const s = STATUS[status] ?? STATUS.pending_review
  const Icon = s.icon
  return (
    <Badge variant="outline" className={cn(s.className, className)} data-testid="receipt-status">
      <Icon aria-hidden />
      {s.label}
    </Badge>
  )
}

/** Data em que a baixa foi feita (decisão), ou o envio. */
export function settledAt(r: ReceiptView): string | null {
  return r.decision?.at ?? r.createdAt
}

export function linesText(lines: ReceiptLine[]): string {
  return lines
    .map((l) => (l.partial ? `${l.description} (parte: ${centsToBRL(l.appliedCents)})` : l.description))
    .join(', ')
}

/** Frase simples do resultado, para o filho. */
export function receiptResultText(r: ReceiptView): string {
  switch (r.status) {
    case 'auto_approved':
    case 'approved':
      return r.applied.length > 0 ? `Pago — baixa feita em: ${linesText(r.applied)}` : 'Pago'
    case 'pending_review':
      return 'Em conferência pela Liderança'
    case 'processing':
      return 'Recebido. Estamos lendo o comprovante.'
    case 'rejected':
      return `Recusado: ${r.rejectionReason || 'sem motivo informado'}`
    case 'reversed':
      return `Baixa desfeita: ${r.reversal?.reason || 'sem motivo informado'}`
  }
}

/** Itens quitados por um comprovante. */
export function AppliedLines({ lines, className }: { lines: ReceiptLine[]; className?: string }) {
  if (lines.length === 0) return null
  return (
    <ul className={cn('space-y-1 text-sm', className)} aria-label="Itens quitados">
      {lines.map((l) => (
        <li key={`${l.type}:${l.id}`} className="flex items-baseline justify-between gap-3">
          <span className="min-w-0">
            {l.description}
            {l.partial && <span className="text-muted-foreground"> · parte de {centsToBRL(l.openCents)}</span>}
          </span>
          <span className="shrink-0 tabular-nums font-medium">{centsToBRL(l.appliedCents)}</span>
        </li>
      ))}
    </ul>
  )
}

const CHECK_STYLE: Record<ReceiptCheck['status'], { label: string; icon: React.ElementType; className: string }> = {
  ok: { label: 'Ok', icon: CheckCircle2, className: 'text-emerald-700 dark:text-emerald-400' },
  warn: { label: 'Atenção', icon: AlertTriangle, className: 'text-amber-700 dark:text-amber-400' },
  fail: { label: 'Falha', icon: XCircle, className: 'text-red-700 dark:text-red-400' },
  skip: { label: 'Não conferido', icon: MinusCircle, className: 'text-muted-foreground' },
}

const CHECK_ORDER: Record<ReceiptCheck['status'], number> = { fail: 0, warn: 1, ok: 2, skip: 3 }

/** Lista das conferências: falhas primeiro, com o texto do back. */
export function ReceiptChecksList({ checks }: { checks: ReceiptCheck[] }) {
  if (checks.length === 0) return <p className="text-sm text-muted-foreground">Sem conferências registradas.</p>
  const sorted = [...checks].sort((a, b) => CHECK_ORDER[a.status] - CHECK_ORDER[b.status])
  return (
    <ul className="space-y-1.5" aria-label="Conferências" data-testid="receipt-checks">
      {sorted.map((c, i) => {
        const s = CHECK_STYLE[c.status] ?? CHECK_STYLE.skip
        const Icon = s.icon
        return (
          <li key={`${c.code}-${i}`} className="flex items-start gap-2 text-sm" data-check={c.code} data-check-status={c.status}>
            <Icon className={cn('mt-0.5 size-4 shrink-0', s.className)} aria-hidden />
            <span>
              <span className={cn('font-medium', s.className)}>{s.label}:</span> {c.message}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Dados lidos do comprovante. */
export function ReceiptFacts({ r }: { r: ReceiptView }) {
  const rows: [string, string | null][] = [
    ['Valor', r.amountCents != null ? centsToBRL(r.amountCents) : null],
    ['Pago em', r.paidAt ? formatDateTime(r.paidAt) : null],
    ['Enviado em', r.createdAt ? formatDateTime(r.createdAt) : null],
    ['Recebedor', [r.receiverName, r.receiverInstitution].filter(Boolean).join(' · ') || null],
    ['Chave de destino', r.destinationKey],
    ['Pagador', [r.payerName, r.payerInstitution].filter(Boolean).join(' · ') || null],
    ['ID da transação', r.e2eId],
  ]
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="min-w-0 break-all font-medium">{v || <span className="font-normal text-muted-foreground">não lido</span>}</dd>
        </div>
      ))}
    </dl>
  )
}

function base64ToBlobUrl(b64: string, type: string): string {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes], { type }))
}

/** Imagem ou PDF do comprovante (getReceiptFile). */
export function ReceiptFilePreview({ receipt, className }: { receipt: ReceiptView; className?: string }) {
  const file = useReceiptFile(receipt.id, receipt.hasFile)
  const data = file.data
  const url = useMemo(() => (data ? base64ToBlobUrl(data.fileBase64, data.contentType) : null), [data])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  if (!receipt.hasFile) {
    return <p className={cn('rounded-lg border border-dashed p-4 text-sm text-muted-foreground', className)}>Arquivo não está mais disponível.</p>
  }
  if (file.isLoading) return <Skeleton className={cn('h-72 w-full rounded-lg', className)} />
  if (file.isError || !data || !url) {
    return (
      <p className={cn('rounded-lg border border-dashed p-4 text-sm text-destructive', className)} role="alert">
        {getErrorMessage(file.error, 'Não foi possível abrir o arquivo.')}
      </p>
    )
  }
  const who = receipt.memberName ? ` de ${receipt.memberName}` : ''
  if (data.contentType === 'application/pdf') {
    return (
      <div className={cn('space-y-2', className)}>
        <iframe src={url} title={`Comprovante${who} (PDF)`} className="h-96 w-full rounded-lg border bg-white" />
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
          <FileText className="size-4" aria-hidden /> Abrir o PDF em outra aba <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    )
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className={cn('block overflow-hidden rounded-lg border bg-muted/30', className)} title="Abrir em tamanho real">
      {/* eslint-disable-next-line @next/next/no-img-element -- blob local, sem otimização do Next */}
      <img src={url} alt={`Comprovante${who}`} className="mx-auto max-h-[28rem] w-auto object-contain" data-testid="receipt-image" />
    </a>
  )
}
