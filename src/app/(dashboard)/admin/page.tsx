'use client'

import Link from 'next/link'
import {
  Users,
  UserPlus,
  CalendarDays,
  UserCheck,
  List,
  Ticket,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { useFinancialStatement } from '@/hooks/use-finance'
import { coraService } from '@/services/cora'
import { Landmark } from 'lucide-react'
import { ROUTES } from '@/constants'
import { CardSkeleton } from '@/components/feedback/card-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/utils'

const quickActions = [
  { label: 'Membros', href: ROUTES.MEMBERS_LIST, icon: Users, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  { label: 'Convites', href: ROUTES.INVITES, icon: UserPlus, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
  { label: 'Financeiro', href: ROUTES.ADMIN_FINANCE, icon: DollarSign, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  { label: 'Calendário', href: ROUTES.ADMIN_CALENDAR, icon: CalendarDays, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' },
  { label: 'Check-ins', href: ROUTES.ADMIN_CHECKINS, icon: UserCheck, color: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400' },
  { label: 'Listas', href: ROUTES.ADMIN_CAMPAIGNS, icon: List, color: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400' },
  { label: 'Rifas', href: ROUTES.ADMIN_RAFFLES, icon: Ticket, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
  { label: 'Loja', href: ROUTES.ADMIN_STORE, icon: ShoppingBag, color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
]

export default function AdminHomePage() {
  const { profile } = useAuthStore()
  const { data: statementData, isLoading, isError, refetch } = useFinancialStatement(1)
  const houseId = useAuthStore((s) => s.currentHouseId())
  const { data: coraBalance } = useQuery({
    queryKey: ['cora-balance', houseId],
    queryFn: () => coraService.getBalance({ houseId: houseId! }),
    enabled: !!houseId,
    staleTime: 60_000,
  })
  const { data: coraStatement } = useQuery({
    queryKey: ['cora-statement', houseId],
    queryFn: () => coraService.getStatement({ houseId: houseId!, limit: 10 }),
    enabled: !!houseId,
    staleTime: 60_000,
  })

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar dashboard"
        message="Não foi possível carregar os dados do painel. Tente novamente."
        onRetry={() => refetch()}
      />
    )
  }

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Admin'

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Olá, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Painel Administrativo
        </p>
      </div>

      {/* Financial Summary Card */}
      {isLoading ? (
        <div className="mb-8 grid grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : statementData?.summary ? (
        <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-primary-foreground/70">Saldo</p>
              {statementData.summary.balance < 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                  Negativo
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {formatCurrency(statementData.summary.balance)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <ArrowDownLeft className="size-3.5" />
                <span className="text-xs font-medium">
                  {formatCurrency(statementData.summary.totalIncome)} receitas
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <ArrowUpRight className="size-3.5" />
                <span className="text-xs font-medium">
                  {formatCurrency(statementData.summary.totalExpense)} despesas
                </span>
              </div>
            </div>
            {coraBalance && (
              <div className="mt-3 flex items-center gap-2 border-t border-white/15 pt-3">
                <Landmark className="size-3.5 text-primary-foreground/70" />
                <span className="text-xs text-primary-foreground/70">Cora:</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(coraBalance.balance / 100)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-8">
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

      {/* Movimentações (Extrato) */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Últimas Movimentações
          </h2>
          <Link
            href={ROUTES.ADMIN_FINANCE}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver tudo
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoading ? (
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
        ) : (() => {
          // Merge platform entries + Cora bank entries
          const platformEntries = (statementData?.data ?? []).slice(0, 10).map((entry) => ({
            id: entry.id,
            type: entry.type as 'income' | 'expense',
            description: entry.description,
            sourceLabel: entry.sourceLabel,
            date: entry.date,
            amount: Math.abs(entry.amount),
            isCora: false,
          }))

          const coraEntries = (coraStatement?.entries ?? []).filter((entry) => entry.createdAt).map((entry) => {
            let dateStr: string | null = null
            try {
              let raw = entry.createdAt as string
              if (typeof raw === 'string' && /\+\d{2}$/.test(raw)) raw = raw + ':00'
              const d = new Date(raw)
              if (!isNaN(d.getTime())) dateStr = d.toISOString()
            } catch { /* skip */ }
            return {
              id: `cora-${entry.id}`,
              type: entry.type === 'CREDIT' ? 'income' as const : 'expense' as const,
              description: entry.transaction?.counterParty?.name || entry.transaction?.description || (entry.type === 'CREDIT' ? 'Recebimento' : 'Pagamento'),
              sourceLabel: 'Cora',
              date: dateStr,
              amount: entry.amount / 100,
              isCora: true,
            }
          })

          const now = Date.now()
          const parseDate = (d: string | null) => {
            if (!d) return now
            if (d.length === 10 && d.includes('-')) return new Date(d + 'T12:00:00').getTime()
            return new Date(d).getTime() || now
          }
          const getDay = (d: string | null) => d ? d.substring(0, 10) : ''

          // Deduplicate: Cora CREDIT with same day+amount+name as platform income → keep only Cora
          const normalize = (s: string) => s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          const coraCredits = new Map<string, boolean>()
          for (const c of coraEntries) {
            if (c.type === 'income') coraCredits.set(`${getDay(c.date)}_${c.amount.toFixed(2)}_${normalize(c.description)}`, true)
          }
          const dedupedPlatform = platformEntries.filter((p) => {
            if (p.type !== 'income') return true
            const day = getDay(p.date)
            const amt = Math.abs(p.amount).toFixed(2)
            const desc = normalize(p.description)
            for (const [key] of coraCredits) {
              const [cDay, cAmt, ...cNameParts] = key.split('_')
              const cName = cNameParts.join('_')
              if (cDay === day && cAmt === amt && cName && desc.includes(cName)) {
                coraCredits.delete(key); return false
              }
            }
            return true
          })

          const allEntries = [...dedupedPlatform, ...coraEntries]
            .sort((a, b) => parseDate(b.date) - parseDate(a.date))
            .slice(0, 12)

          return allEntries.length > 0 ? (
            <Card>
              <CardContent className="divide-y p-0">
                {allEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                      entry.isCora
                        ? 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400'
                        : entry.type === 'income'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                    }`}>
                      {entry.isCora ? (
                        <Landmark className="size-4" />
                      ) : entry.type === 'income' ? (
                        <ArrowDownLeft className="size-4" />
                      ) : (
                        <ArrowUpRight className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.sourceLabel}
                        {entry.date ? ` · ${formatDate(entry.date)}` : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${
                      entry.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma movimentação encontrada</p>
              </CardContent>
            </Card>
          )
        })()}
      </div>
    </div>
  )
}
