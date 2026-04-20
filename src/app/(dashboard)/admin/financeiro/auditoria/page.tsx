'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  RotateCcw,
  Filter,
  FileSearch,
} from 'lucide-react'
import { useLedger, useReverseLedgerEntry } from '@/hooks/use-ledger'
import { useAllMembers } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate } from '@/utils'
import { SOURCE_LABELS, CHANNEL_LABELS, STATUS_LABELS, STATUS_VARIANTS } from '@/lib/ledger-labels'
import type { LedgerSource, LedgerStatus, LedgerDirection, LedgerEntryView } from '@/types/ledger'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/forms/date-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingState } from '@/components/feedback/loading-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export default function LedgerAuditPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCashier'))

  const [page, setPage] = useState(1)
  const [memberId, setMemberId] = useState<string>('')
  const [source, setSource] = useState<LedgerSource | ''>('')
  const [status, setStatus] = useState<LedgerStatus | ''>('')
  const [direction, setDirection] = useState<LedgerDirection | ''>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const [reverseTarget, setReverseTarget] = useState<LedgerEntryView | null>(null)
  const [reverseReason, setReverseReason] = useState('')

  const { data: members } = useAllMembers()
  const membersList = members?.data ?? []

  const ledgerQuery = useLedger({
    page,
    limit: 30,
    memberId: memberId || undefined,
    source: source || undefined,
    status: status || undefined,
    direction: direction || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const reverseMutation = useReverseLedgerEntry()

  if (!canManage) {
    return (
      <ErrorState
        title="Acesso restrito"
        message="Você não tem permissão para acessar esta página."
      />
    )
  }

  const entries = ledgerQuery.data?.data ?? []
  const pagination = ledgerQuery.data?.pagination

  const clearFilters = () => {
    setMemberId(''); setSource(''); setStatus(''); setDirection('')
    setStartDate(''); setEndDate(''); setPage(1)
  }

  const confirmReverse = () => {
    if (!reverseTarget || !reverseReason.trim() || !houseId) return
    reverseMutation.mutate(
      { houseId, entryId: reverseTarget.id, reason: reverseReason.trim() },
      {
        onSuccess: () => {
          setReverseTarget(null)
          setReverseReason('')
        },
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <Link href={ROUTES.ADMIN_FINANCE}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          Voltar ao financeiro
        </Button>
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <FileSearch className="size-6" />
          Auditoria do Ledger
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lista bruta de lançamentos imutáveis. Use para investigar discrepâncias e estornar entradas específicas.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="size-4" />
            Filtros
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Membro</label>
              <select
                className={SELECT_CLASS}
                value={memberId}
                onChange={(e) => { setMemberId(e.target.value); setPage(1) }}
              >
                <option value="">Todos</option>
                {membersList.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <select
                className={SELECT_CLASS}
                value={source}
                onChange={(e) => { setSource(e.target.value as LedgerSource | ''); setPage(1) }}
              >
                <option value="">Todos</option>
                {(Object.keys(SOURCE_LABELS) as LedgerSource[]).map((s) => (
                  <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                className={SELECT_CLASS}
                value={status}
                onChange={(e) => { setStatus(e.target.value as LedgerStatus | ''); setPage(1) }}
              >
                <option value="">Todos</option>
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendente</option>
                <option value="reversed">Estornado</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Direção</label>
              <select
                className={SELECT_CLASS}
                value={direction}
                onChange={(e) => { setDirection(e.target.value as LedgerDirection | ''); setPage(1) }}
              >
                <option value="">Todos</option>
                <option value="credit">Entrada</option>
                <option value="debit">Saída</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">De</label>
              <DateInput
                value={startDate}
                onValueChange={(v) => { setStartDate(v); setPage(1) }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Até</label>
              <DateInput
                value={endDate}
                onValueChange={(v) => { setEndDate(v); setPage(1) }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries list */}
      {ledgerQuery.isLoading ? (
        <LoadingState message="Carregando ledger..." />
      ) : ledgerQuery.isError ? (
        <ErrorState
          title="Erro ao carregar"
          message="Não foi possível carregar o ledger."
          onRetry={() => ledgerQuery.refetch()}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum lançamento encontrado"
          description="Ajuste os filtros para ver lançamentos."
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isReversed = entry.status === 'reversed'
            const isReversal = !!entry.reverses
            const isCredit = entry.direction === 'credit'
            return (
              <Card
                key={entry.id}
                className={`rounded-xl ${isReversed ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-sm font-medium ${
                            isReversed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {isReversal && (
                            <RotateCcw className="mr-1 inline size-3 text-destructive" />
                          )}
                          {entry.description}
                        </span>
                        <Badge variant="secondary" className="text-[0.65rem]">
                          {SOURCE_LABELS[entry.source] ?? entry.source}
                        </Badge>
                        <Badge variant={STATUS_VARIANTS[entry.status]} className="text-[0.65rem]">
                          {STATUS_LABELS[entry.status]}
                        </Badge>
                        <Badge variant="outline" className="text-[0.65rem]">
                          {CHANNEL_LABELS[entry.channel] ?? entry.channel}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{formatDate(entry.createdAt)}</span>
                        <span>ID: {entry.id.slice(0, 8)}…</span>
                        <span>Origem: {entry.sourceId.slice(0, 10)}…</span>
                        {entry.reverses && (
                          <span>Estorna: {entry.reverses.slice(0, 8)}…</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        } ${isReversed ? 'line-through' : ''}`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatCurrency(entry.amount)}
                      </span>
                      {entry.status === 'confirmed' && !isReversal && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 text-xs"
                          onClick={() => {
                            setReverseTarget(entry)
                            setReverseReason('')
                          }}
                        >
                          <RotateCcw className="size-3" />
                          Estornar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Próximo
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reverse dialog */}
      <Dialog open={!!reverseTarget} onOpenChange={(open) => { if (!open) setReverseTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estornar lançamento?</DialogTitle>
            <DialogDescription>
              Será criado um lançamento oposto que cancela o original. A entrada original
              permanece no ledger para auditoria, mas marcada como estornada.
            </DialogDescription>
          </DialogHeader>

          {reverseTarget && (
            <div className="space-y-3 rounded-md bg-muted/40 p-3 text-sm">
              <p className="font-medium">{reverseTarget.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{SOURCE_LABELS[reverseTarget.source] ?? reverseTarget.source}</span>
                <span>
                  {reverseTarget.direction === 'credit' ? '+' : '-'}
                  {formatCurrency(reverseTarget.amount)}
                </span>
                <span>{formatDate(reverseTarget.createdAt)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Motivo do estorno</label>
            <Input
              placeholder="Explique por que este lançamento está sendo estornado"
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReverseTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReverse}
              disabled={reverseMutation.isPending || !reverseReason.trim()}
            >
              {reverseMutation.isPending ? 'Estornando...' : 'Confirmar estorno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
