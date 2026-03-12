'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useMonthlyFees, useDebts } from '@/hooks/use-finance'
import { useAuthStore } from '@/stores/auth'
import { FEE_STATUS_LABELS } from '@/constants'
import type { MonthlyFeeItem, DebtItem, FeeStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { LoadingState } from '@/components/feedback/loading-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'

function statusBadgeClasses(status: FeeStatus) {
  switch (status) {
    case 'pending':
      return 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
    case 'paid':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
    case 'overdue':
      return 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
    case 'cancelled':
      return 'border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400'
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

export default function MemberFinancePage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'debitos' ? 'debitos' : 'mensalidades'
  const memberId = useAuthStore((s) => s.currentHouse?.memberId)

  const {
    data: feesData,
    isLoading: feesLoading,
    isError: feesError,
    refetch: refetchFees,
  } = useMonthlyFees(1, memberId)

  const {
    data: debtsData,
    isLoading: debtsLoading,
    isError: debtsError,
    refetch: refetchDebts,
  } = useDebts(1, memberId)

  const fees: MonthlyFeeItem[] = feesData?.data ?? []
  const debts: DebtItem[] = debtsData?.data ?? []

  const { totalPending, totalPaid } = useMemo(() => {
    let pending = 0
    let paid = 0
    for (const fee of fees) {
      if (fee.status === 'pending' || fee.status === 'overdue') {
        pending += fee.amount
      } else if (fee.status === 'paid') {
        paid += fee.amount
      }
    }
    for (const debt of debts) {
      if (debt.status === 'pending' || debt.status === 'overdue') {
        pending += debt.remainingAmount
      }
    }
    return { totalPending: pending, totalPaid: paid }
  }, [fees, debts])

  const isLoading = feesLoading || debtsLoading

  if (isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingState message="Carregando financeiro..." inline />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Financeiro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe suas mensalidades e débitos
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

      {/* Tabs */}
      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
          <TabsTrigger value="debitos">Débitos</TabsTrigger>
        </TabsList>

        {/* Mensalidades Tab */}
        <TabsContent value="mensalidades">
          {feesError ? (
            <ErrorState
              title="Erro ao carregar mensalidades"
              message="Não foi possível carregar suas mensalidades."
              onRetry={() => refetchFees()}
            />
          ) : fees.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhuma mensalidade"
              description="Você não possui mensalidades registradas."
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
              title="Erro ao carregar débitos"
              message="Não foi possível carregar seus débitos."
              onRetry={() => refetchDebts()}
            />
          ) : debts.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhum débito"
              description="Você não possui débitos registrados."
            />
          ) : (
            <div className="space-y-2">
              {debts.map((debt) => (
                <Card key={debt.id} className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {debt.description}
                          </span>
                          <Badge
                            variant="outline"
                            className={statusBadgeClasses(debt.status)}
                          >
                            {statusIcon(debt.status)}
                            <span className="ml-1">
                              {FEE_STATUS_LABELS[debt.status] ?? debt.status}
                            </span>
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Total: {formatCurrency(debt.amount)}</span>
                          <span>
                            Restante: {formatCurrency(debt.remainingAmount)}
                          </span>
                          {debt.dueDate && (
                            <span>Vencimento: {formatDate(debt.dueDate)}</span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatCurrency(debt.remainingAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
