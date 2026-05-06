'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
} from 'lucide-react'
import { useMonthlyFees, useDebts, useLegacyMyFinancialSummary } from '@/hooks/use-finance'
import { useFinancialStatement } from '@/hooks/use-ledger'
import { useAuthStore } from '@/stores/auth'
import { FEE_STATUS_LABELS } from '@/constants'
import type { MonthlyFeeItem, DebtItem, ShoppingDebtItem, QuotaItem, SaleItem, FeeStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils'
import { SOURCE_LABELS, channelLabel } from '@/lib/ledger-labels'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { LoadingState } from '@/components/feedback/loading-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function statusBadgeClasses(status: FeeStatus) {
  switch (status) {
    case 'pending':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400'
    case 'paid':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400'
    case 'overdue':
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400'
    case 'cancelled':
      return 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500'
    default:
      return ''
  }
}

function statusIcon(status: FeeStatus) {
  switch (status) {
    case 'pending':
      return <Clock className="size-3.5" />
    case 'paid':
      return <CheckCircle2 className="size-3.5" />
    case 'overdue':
      return <AlertTriangle className="size-3.5" />
    default:
      return null
  }
}

function formatYearMonth(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export default function MemberFinancePage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab =
    tabParam === 'debitos' ? 'debitos' : tabParam === 'historico' ? 'historico' : 'mensalidades'
  const memberId = useAuthStore((s) => s.currentHouse?.memberId)
  const [historyPage, setHistoryPage] = useState(1)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const selectedMonth = formatYearMonth(year, month)

  const {
    data: feesData,
    isLoading: feesLoading,
    isError: feesError,
    refetch: refetchFees,
  } = useMonthlyFees(1, memberId, undefined, selectedMonth)

  // All fees (for totalPending calculation)
  const { data: allFeesData } = useMonthlyFees(1, memberId)
  const allFees: MonthlyFeeItem[] = allFeesData?.data ?? []

  const {
    data: debtsData,
    isLoading: debtsLoading,
    isError: debtsError,
    refetch: refetchDebts,
  } = useDebts(1, memberId)

  // Legacy summary still needed for per-item listings (shoppingDebts, quotas, storeTab)
  // pending totals come from the unified ledger endpoint below.
  const {
    data: financialSummary,
    isLoading: summaryLoading,
  } = useLegacyMyFinancialSummary()

  // New unified ledger-based statement
  const { data: statement, isLoading: statementLoading } = useFinancialStatement({
    page: historyPage,
    limit: 30,
  })

  const fees: MonthlyFeeItem[] = feesData?.data ?? []
  const debts: DebtItem[] = debtsData?.data ?? []
  const shoppingDebts: ShoppingDebtItem[] = financialSummary?.shoppingDebts ?? []
  const quotas: QuotaItem[] = (financialSummary?.quotas ?? []).filter((q) => q.status !== 'paid')
  const storeTab: SaleItem[] = financialSummary?.storeTab ?? []

  const currentMonth = formatYearMonth(now.getFullYear(), now.getMonth())

  // Totals from ledger (authoritative source).
  // Fallback to client-side calculation while statement loads.
  const { totalPending, totalPaid } = useMemo(() => {
    if (statement) {
      return {
        totalPending: statement.pending.amount,
        totalPaid: statement.balance.revenue,
      }
    }
    let pending = 0
    let paid = 0
    for (const fee of allFees) {
      if (fee.status === 'pending' || fee.status === 'overdue') {
        const feeMonth = fee.referenceMonth || ''
        if (feeMonth <= currentMonth) {
          pending += fee.amount
        }
      } else if (fee.status === 'paid') {
        paid += fee.amount
      }
    }
    for (const debt of debts) {
      if (debt.status === 'pending' || debt.status === 'overdue') {
        pending += debt.remainingAmount
      }
    }
    for (const sd of shoppingDebts) {
      pending += sd.amount
    }
    for (const q of quotas) {
      pending += q.amount - q.paidAmount
    }
    for (const s of storeTab) {
      pending += s.totalPrice
    }
    return { totalPending: pending, totalPaid: paid }
  }, [statement, allFees, debts, shoppingDebts, quotas, storeTab, currentMonth])

  const goToPrevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const goToNextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  const goToToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  const isLoading = feesLoading || debtsLoading || summaryLoading || statementLoading

  if (isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingState message="Carregando financeiro..." inline />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Financeiro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe suas mensalidades e debitos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <AlertTriangle className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                  Total pendente
                </p>
                <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {formatCurrency(totalPending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  Total pago
                </p>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending breakdown by type (from ledger) */}
      {statement && statement.pending.amount > 0 && (
        <Card className="rounded-xl">
          <CardContent className="py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pendências por tipo
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { key: 'fees', label: 'Mensalidades' },
                { key: 'debts', label: 'Dívidas' },
                { key: 'quotas', label: 'Cotas' },
                { key: 'sales', label: 'Loja' },
                { key: 'shopping', label: 'Trabalhos' },
              ].map(({ key, label }) => {
                const item = statement.pending.byType[key as keyof typeof statement.pending.byType]
                if (!item || item.amount === 0) return null
                return (
                  <div key={key} className="rounded-md bg-muted/40 px-2 py-1.5">
                    <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                    <p className="text-[0.65rem] text-muted-foreground">
                      {item.count} {item.count === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
          <TabsTrigger value="debitos">Debitos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Mensalidades Tab */}
        <TabsContent value="mensalidades" className="space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between rounded-lg border bg-card p-2">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <button
              type="button"
              onClick={goToToday}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {MONTH_NAMES[month]} {year}
            </button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {feesError ? (
            <ErrorState
              title="Erro ao carregar mensalidades"
              message="Nao foi possivel carregar suas mensalidades."
              onRetry={() => refetchFees()}
            />
          ) : fees.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhuma mensalidade"
              description={`Nenhuma mensalidade em ${MONTH_NAMES[month]} ${year}.`}
            />
          ) : (
            <div className="space-y-2">
              {fees.map((fee) => (
                <Card key={fee.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {fee.referenceMonth}
                          </span>
                          <Badge
                            variant="outline"
                            className={statusBadgeClasses(fee.status)}
                          >
                            {statusIcon(fee.status)}
                            <span className="ml-1">
                              {FEE_STATUS_LABELS[fee.status] ?? fee.status}
                            </span>
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {fee.dueDate && <span>Vencimento: {formatDate(fee.dueDate)}</span>}
                          {fee.paidAt && (
                            <span>Pago em: {formatDate(fee.paidAt)}</span>
                          )}
                          {fee.paymentMethod && (
                            <span>{fee.paymentMethod}</span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatCurrency(fee.amount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Debitos Tab */}
        <TabsContent value="debitos">
          {debtsError ? (
            <ErrorState
              title="Erro ao carregar debitos"
              message="Nao foi possivel carregar seus debitos."
              onRetry={() => refetchDebts()}
            />
          ) : debts.length === 0 && shoppingDebts.length === 0 && quotas.length === 0 && storeTab.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhum debito"
              description="Voce nao possui debitos registrados."
            />
          ) : (
            <div className="space-y-2">
              {/* Trabalhos / Jogos pendentes */}
              {shoppingDebts.map((item) => (
                <Card key={item.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.listTitle}</span>
                          <Badge variant="outline" className={statusBadgeClasses('pending')}>
                            {statusIcon('pending')}
                            <span className="ml-1">Pendente</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.listType === 'job' ? 'Trabalho' : item.listType === 'game' ? 'Jogo' : 'Lista'}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Cotas de campanhas pendentes */}
              {quotas.map((q) => (
                <Card key={q.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{q.campaignName ?? 'Campanha'}</span>
                          <Badge variant="outline" className={statusBadgeClasses(q.status === 'partial' ? 'pending' : q.status)}>
                            {statusIcon(q.status === 'partial' ? 'pending' : q.status)}
                            <span className="ml-1">{q.status === 'partial' ? 'Parcial' : 'Pendente'}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">Cota</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Total: {formatCurrency(q.amount)}</span>
                          {q.paidAmount > 0 && <span>Pago: {formatCurrency(q.paidAmount)}</span>}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{formatCurrency(q.amount - q.paidAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Cantina/Loja fiado */}
              {storeTab.map((s) => (
                <Card key={s.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {s.itemName || 'Compra fiado'}
                            {s.quantity > 1 && ` x${s.quantity}`}
                          </span>
                          <Badge variant="outline" className={statusBadgeClasses('pending')}>
                            {statusIcon('pending')}
                            <span className="ml-1">Pendente</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">Cantina</Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatDate(s.createdAt)}</div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{formatCurrency(s.totalPrice)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Debitos manuais */}
              {debts.map((debt) => (
                <Card key={debt.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{debt.description}</span>
                          <Badge variant="outline" className={statusBadgeClasses(debt.status)}>
                            {statusIcon(debt.status)}
                            <span className="ml-1">{FEE_STATUS_LABELS[debt.status] ?? debt.status}</span>
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Total: {formatCurrency(debt.amount)}</span>
                          <span>Restante: {formatCurrency(debt.remainingAmount)}</span>
                          {debt.dueDate && <span>Vencimento: {formatDate(debt.dueDate)}</span>}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{formatCurrency(debt.remainingAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Histórico (ledger) */}
        <TabsContent value="historico" className="space-y-3">
          {!statement || statement.data.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nenhuma movimentação"
              description="Você ainda não possui lançamentos registrados."
            />
          ) : (
            <>
              <div className="space-y-2">
                {statement.data.map((entry) => {
                  const isCredit = entry.direction === 'credit'
                  const isReversed = entry.status === 'reversed'
                  const isReversal = !!entry.reverses
                  return (
                    <Card
                      key={entry.id}
                      className={`rounded-xl ${isReversed ? 'opacity-60' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  isReversed ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                {isReversal && <RotateCcw className="mr-1 inline size-3 text-destructive" />}
                                {entry.description}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {SOURCE_LABELS[entry.source] ?? entry.source}
                              </Badge>
                              {entry.channel !== 'internal' && (
                                <Badge variant="outline" className="text-xs">
                                  {channelLabel(entry.channel)}
                                </Badge>
                              )}
                              {entry.status === 'pending' && (
                                <Badge
                                  variant="outline"
                                  className={statusBadgeClasses('pending')}
                                >
                                  Pendente
                                </Badge>
                              )}
                              {isReversed && (
                                <Badge variant="destructive" className="text-xs">
                                  Estornado
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {formatDate(entry.createdAt)}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 text-sm font-semibold ${
                              isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            } ${isReversed ? 'line-through' : ''}`}
                          >
                            {isCredit ? '+' : '-'}
                            {formatCurrency(entry.amount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {statement.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!statement.pagination.hasPrev}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {statement.pagination.page} de {statement.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!statement.pagination.hasNext}
                    onClick={() => setHistoryPage((p) => p + 1)}
                  >
                    Próximo
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
