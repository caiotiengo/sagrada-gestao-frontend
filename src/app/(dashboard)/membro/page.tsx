'use client'

import Link from 'next/link'
import {
  DollarSign,
  CalendarDays,
  List,
  Ticket,
  ShoppingCart,
  StickyNote,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Store,
  ArrowDownLeft,
  TrendingDown,
  Receipt,
  ListChecks,
  Briefcase,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useMyFinancialSummary } from '@/hooks/use-finance'
import { ROLE_LABELS, ROUTES } from '@/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials, formatCurrency, formatDate } from '@/utils'

const quickActions = [
  { label: 'Financeiro', href: ROUTES.MEMBER_FINANCE, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
  { label: 'Calendário', href: ROUTES.MEMBER_CALENDAR, icon: CalendarDays, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  { label: 'Listas', href: ROUTES.MEMBER_CAMPAIGNS, icon: List, color: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400' },
  { label: 'Rifas', href: ROUTES.MEMBER_RAFFLES, icon: Ticket, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
  { label: 'Cantina', href: ROUTES.MEMBER_STORE, icon: Store, color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
  { label: 'Compras', href: ROUTES.MEMBER_SHOPPING, icon: ShoppingCart, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  { label: 'Notas', href: ROUTES.MEMBER_NOTES, icon: StickyNote, color: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400' },
]

export default function MemberHomePage() {
  const { profile, currentHouse } = useAuthStore()
  const { data: financialSummary, isLoading: isLoadingSummary } = useMyFinancialSummary()

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Membro'
  const roleLabel = currentHouse?.role ? ROLE_LABELS[currentHouse.role] ?? currentHouse.role : ''
  const totals = financialSummary?.totals ?? {
    pendingFeesTotal: 0,
    overdueFeesTotal: 0,
    totalDebt: 0,
    storeTabTotal: 0,
    totalQuotasPending: 0,
    totalShoppingPending: 0,
    totalOwed: 0,
    totalFeesPaid: 0,
    totalDebtsPaid: 0,
    totalPurchasesPaid: 0,
    totalQuotasPaid: 0,
    totalPaid: 0,
  }

  const pendingFees = financialSummary?.pendingFees ?? []
  const debts = financialSummary?.debts ?? []
  const storeTab = financialSummary?.storeTab ?? []
  const quotas = (financialSummary?.quotas ?? []).filter((q) => q.status !== 'paid')
  const shoppingDebts = financialSummary?.shoppingDebts ?? []
  const recentPayments = financialSummary?.recentPayments ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Welcome Header */}
      <div className="mb-6 flex items-center gap-3">
        <Avatar size="lg">
          {profile?.photoUrl && (
            <AvatarImage src={profile.photoUrl} alt={profile.fullName} />
          )}
          <AvatarFallback>
            {profile?.fullName ? getInitials(profile.fullName) : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Olá, {firstName}
          </h1>
          <Badge variant="secondary" className="mt-1">{roleLabel}</Badge>
        </div>
      </div>

      {/* Financial Overview Banner */}
      {isLoadingSummary ? (
        <div className="mb-8">
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : (
        <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-primary-foreground/70">Saldo</p>
              {totals.totalOwed > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                  Pendente
                </span>
              )}
              {totals.totalOwed === 0 && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                  Em dia
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {totals.totalOwed > 0 ? '-' : ''}{formatCurrency(totals.totalOwed)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {totals.pendingFeesTotal > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <AlertCircle className="size-3.5" />
                  <span className="text-xs font-medium">
                    Mensalidades: {formatCurrency(totals.pendingFeesTotal)}
                  </span>
                </div>
              )}
              {totals.totalDebt > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <CreditCard className="size-3.5" />
                  <span className="text-xs font-medium">
                    Débitos: {formatCurrency(totals.totalDebt)}
                  </span>
                </div>
              )}
              {totals.storeTabTotal > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <Store className="size-3.5" />
                  <span className="text-xs font-medium">
                    Loja: {formatCurrency(totals.storeTabTotal)}
                  </span>
                </div>
              )}
              {totals.totalQuotasPending > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <ListChecks className="size-3.5" />
                  <span className="text-xs font-medium">
                    Cotas: {formatCurrency(totals.totalQuotasPending)}
                  </span>
                </div>
              )}
              {totals.totalShoppingPending > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <Briefcase className="size-3.5" />
                  <span className="text-xs font-medium">
                    Trabalhos/Jogos: {formatCurrency(totals.totalShoppingPending)}
                  </span>
                </div>
              )}
              {totals.totalPaid > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <ArrowDownLeft className="size-3.5" />
                  <span className="text-xs font-medium">
                    Pago: {formatCurrency(totals.totalPaid)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className={`flex size-12 items-center justify-center rounded-2xl transition-transform duration-150 group-hover:scale-105 ${action.color}`}>
                  <action.icon className="size-5" />
                </div>
                <span className="text-center text-[0.6875rem] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Movimentações */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Movimentações
          </h2>
          <Link
            href={ROUTES.MEMBER_FINANCE}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver tudo
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoadingSummary ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (pendingFees.length > 0 || debts.length > 0 || storeTab.length > 0 || quotas.length > 0 || shoppingDebts.length > 0 || recentPayments.length > 0) ? (
          <Card>
            <CardContent className="divide-y p-0">
              {/* Mensalidades pendentes */}
              {pendingFees.slice(0, 3).map((fee) => (
                <Link
                  key={fee.id}
                  href={`${ROUTES.MEMBER_FINANCE}?tab=mensalidades`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <AlertCircle className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Mensalidade</p>
                    <p className="text-xs text-muted-foreground">
                      Ref. {fee.referenceMonth} · Vence {formatDate(fee.dueDate)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                    -{formatCurrency(fee.amount)}
                  </span>
                </Link>
              ))}

              {/* Débitos ativos */}
              {debts.slice(0, 3).map((debt) => (
                <Link
                  key={debt.id}
                  href={`${ROUTES.MEMBER_FINANCE}?tab=debitos`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                    <TrendingDown className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{debt.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Débito{debt.dueDate ? ` · Vence ${formatDate(debt.dueDate)}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                    -{formatCurrency(debt.remainingAmount)}
                  </span>
                </Link>
              ))}

              {/* Conta da loja */}
              {storeTab.slice(0, 3).map((sale) => (
                <Link
                  key={sale.id}
                  href={`${ROUTES.MEMBER_FINANCE}?tab=debitos`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                    <ShoppingCart className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{sale.itemName ?? 'Item da loja'}</p>
                    <p className="text-xs text-muted-foreground">
                      Loja · {formatDate(sale.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-purple-600 dark:text-purple-400">
                    -{formatCurrency(sale.totalPrice)}
                  </span>
                </Link>
              ))}

              {/* Cotas de listas */}
              {quotas.slice(0, 3).map((quota) => (
                <Link
                  key={quota.id}
                  href={ROUTES.MEMBER_CAMPAIGNS}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400">
                    <ListChecks className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{quota.campaignName || 'Cota de lista'}</p>
                    <p className="text-xs text-muted-foreground">
                      {quota.status === 'partial' ? 'Parcial' : 'Pendente'} · Pago {formatCurrency(quota.paidAmount)} de {formatCurrency(quota.amount)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-pink-600 dark:text-pink-400">
                    -{formatCurrency(quota.amount - quota.paidAmount)}
                  </span>
                </Link>
              ))}

              {/* Trabalhos/Jogos pendentes */}
              {shoppingDebts.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={ROUTES.MEMBER_SHOPPING}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Briefcase className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.listTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.listType === 'game' ? 'Jogo' : item.listType === 'job' ? 'Trabalho' : 'Lista'} · Pendente
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                    -{formatCurrency(item.amount)}
                  </span>
                </Link>
              ))}

              {/* Últimos pagamentos */}
              {recentPayments.slice(0, 5).map((payment) => (
                <Link
                  key={payment.id}
                  href={ROUTES.MEMBER_FINANCE}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    payment.type === 'income'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                  }`}>
                    {payment.type === 'income' ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <Receipt className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{payment.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.category}{payment.paidAt ? ` · ${formatDate(payment.paidAt)}` : ''}
                    </p>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold tabular-nums ${
                    payment.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {payment.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(payment.amount))}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma movimentação encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
