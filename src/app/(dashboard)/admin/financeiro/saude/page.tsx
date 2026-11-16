'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { useValidateLedger, useReconcileSummary } from '@/hooks/use-ledger'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'

const ENTITY_LABELS = {
  fees: 'Mensalidades pagas',
  sales: 'Vendas pagas',
  quotas: 'Cotas de campanha',
  contributions: 'Contribuições externas',
  raffles: 'Rifas',
  shopping: 'Trabalhos/Jogos',
  paymentsIncome: 'Pagamentos (entrada)',
  paymentsExpense: 'Pagamentos (saída)',
  memberChargesExpense: 'Cobranças pagas pela casa',
} as const

export default function FinanceHealthPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCashier'))

  const { data: validation, isLoading, isError, refetch } = useValidateLedger()
  const reconcile = useReconcileSummary()

  if (!canManage) {
    return (
      <ErrorState
        title="Acesso restrito"
        message="Você não tem permissão para acessar esta página."
      />
    )
  }

  if (isLoading) {
    return <LoadingState message="Validando ledger..." />
  }

  if (isError || !validation || !houseId) {
    return (
      <ErrorState
        title="Erro ao validar ledger"
        message="Não foi possível validar o ledger da casa."
        onRetry={() => refetch()}
      />
    )
  }

  const isBalanced = validation.isBalanced
  const drift = validation.drift ?? { credit: 0, debit: 0, net: 0 }

  // Comparação ledger x entidades (o back devolve os totais do ledger e o
  // detalhamento só do lado das entidades).
  const ledger = validation.ledger ?? { credit: 0, debit: 0, net: 0, entriesCount: 0 }
  const entities = validation.entities ?? { credit: 0, debit: 0, byType: {} }
  const entityByType: Partial<Record<keyof typeof ENTITY_LABELS, number>> = entities.byType ?? {}

  const diffRows = [
    { key: 'credit', label: 'Entradas', ledgerValue: ledger.credit ?? 0, entityValue: entities.credit ?? 0, diff: drift?.credit ?? 0 },
    { key: 'debit', label: 'Saídas', ledgerValue: ledger.debit ?? 0, entityValue: entities.debit ?? 0, diff: drift?.debit ?? 0 },
  ]

  const hasDrift = diffRows.some((r) => Math.abs(r.diff) > 0.01)

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <Link href={ROUTES.ADMIN_FINANCE}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          Voltar ao financeiro
        </Button>
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <ShieldCheck className="size-6" />
          Saúde Financeira
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifica a consistência entre o ledger (fonte de verdade) e os saldos
          agregados.
        </p>
      </div>

      {/* Status card */}
      <Card className={isBalanced ? 'border-emerald-200' : 'border-amber-300'}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="size-6" />
              </div>
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <AlertTriangle className="size-6" />
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">
                {isBalanced ? 'Ledger consistente' : 'Divergência detectada'}
              </p>
              <p className="text-xs text-muted-foreground">
                {ledger.entriesCount ?? 0} lançamento(s) no ledger
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => reconcile.mutate()}
            disabled={reconcile.isPending}
          >
            <RotateCcw className={`size-4 ${reconcile.isPending ? 'animate-spin' : ''}`} />
            {reconcile.isPending ? 'Recalculando...' : 'Recalcular saldos'}
          </Button>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground">Receita (ledger)</p>
            <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(ledger.credit ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground">Despesa (ledger)</p>
            <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(ledger.debit ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground">Líquido</p>
            <p className="mt-1 text-lg font-semibold">
              {formatCurrency(ledger.net ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Drift detail */}
      {!isBalanced && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Scale className="size-5" />
              Diferença detectada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Drift em créditos</p>
                <p className="text-sm font-semibold">{formatCurrency(drift.credit)}</p>
              </div>
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Drift em débitos</p>
                <p className="text-sm font-semibold">{formatCurrency(drift.debit)}</p>
              </div>
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Drift líquido</p>
                <p className="text-sm font-semibold">{formatCurrency(drift.net)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Clique em &ldquo;Recalcular saldos&rdquo; para recompor {' '}
              <code className="text-xs">houseSummaries</code>{' '}
              a partir do ledger. Se a divergência persistir, abra a{' '}
              <Link href={ROUTES.ADMIN_FINANCE_AUDIT} className="text-primary hover:underline">
                auditoria do ledger
              </Link>{' '}
              para investigar entradas individuais.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ledger x entidades */}
      <Card>
        <CardHeader>
          <CardTitle>Consistência ledger x registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {diffRows.map((row) => {
              const isDivergent = Math.abs(row.diff) > 0.01
              return (
                <div
                  key={row.key}
                  className="grid grid-cols-4 items-center gap-3 py-3 text-sm"
                >
                  <div className="col-span-1 font-medium">{row.label}</div>
                  <div className="col-span-1 text-right text-xs text-muted-foreground">
                    Ledger: {formatCurrency(row.ledgerValue)}
                  </div>
                  <div className="col-span-1 text-right text-xs text-muted-foreground">
                    Registros: {formatCurrency(row.entityValue)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {isDivergent ? (
                      <Badge variant="destructive">
                        {formatCurrency(Math.abs(row.diff))}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400">
                        OK
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalhe dos registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros por tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {(Object.keys(ENTITY_LABELS) as Array<keyof typeof ENTITY_LABELS>).map((key) => (
              <div key={key} className="flex items-center justify-between py-2 text-sm">
                <span>{ENTITY_LABELS[key]}</span>
                <span className="font-medium">{formatCurrency(entityByType[key] ?? 0)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {hasDrift && (
        <div className="flex flex-wrap gap-2">
          <Link href={ROUTES.ADMIN_FINANCE_AUDIT}>
            <Button variant="outline">Ir para auditoria do ledger</Button>
          </Link>
          <Link href={ROUTES.ADMIN_FINANCE_BACKFILL}>
            <Button variant="outline">Executar backfill</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
