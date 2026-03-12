'use client'

import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Info,
  Loader2,
  Ticket,
  Trophy,
} from 'lucide-react'

import { useRaffleDetails, useReserveRaffleNumbers } from '@/hooks/use-raffles'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDate } from '@/utils'
import type { RaffleStatus } from '@/types'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<RaffleStatus, string> = {
  draft: 'Rascunho',
  selling: 'Vendendo',
  drawn: 'Sorteada',
  cancelled: 'Cancelada',
}

const STATUS_VARIANTS: Record<
  RaffleStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  selling: 'default',
  drawn: 'outline',
  cancelled: 'destructive',
}

export default function MemberRaffleDetailPage() {
  const params = useParams()
  const raffleId = params.id as string

  const houseId = useAuthStore((s) => s.currentHouseId())
  const memberId = useAuthStore((s) => s.currentHouse?.memberId)
  const profile = useAuthStore((s) => s.profile)

  const {
    data: raffle,
    isLoading,
    isError,
    refetch,
  } = useRaffleDetails(raffleId)

  const { mutate: reserve, isPending } = useReserveRaffleNumbers()

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])

  // Build set of taken numbers
  const soldNumbersSet = useMemo(() => {
    if (!raffle) return new Set<number>()
    return new Set(raffle.numbers.map((n) => n.number))
  }, [raffle])

  const toggleNumber = useCallback(
    (num: number) => {
      if (soldNumbersSet.has(num)) return
      setSelectedNumbers((prev) =>
        prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
      )
    },
    [soldNumbersSet],
  )

  function handleReserve() {
    if (!raffle || !houseId || selectedNumbers.length === 0) return

    reserve(
      {
        houseId,
        raffleId: raffle.id,
        numbers: selectedNumbers,
        buyerName: profile?.fullName ?? '',
        buyerPhone: profile?.phone ?? '',
        memberId: memberId ?? undefined,
      },
      {
        onSuccess: () => {
          setSelectedNumbers([])
          refetch()
        },
      },
    )
  }

  if (isLoading) {
    return <LoadingState message="Carregando detalhes da rifa..." />
  }

  if (isError || !raffle) {
    return (
      <ErrorState
        title="Erro ao carregar rifa"
        message="Nao foi possivel carregar os detalhes desta rifa."
        onRetry={() => refetch()}
      />
    )
  }

  const progress =
    raffle.totalNumbers > 0
      ? Math.round((raffle.soldNumbers / raffle.totalNumbers) * 100)
      : 0

  const totalSelected = selectedNumbers.length
  const totalPrice = totalSelected * raffle.numberPrice
  const isClosed = raffle.status === 'drawn' || raffle.status === 'cancelled'
  const isSelling = raffle.status === 'selling'

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Back Button */}
      <Link href={ROUTES.MEMBER_RAFFLES}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {raffle.title}
          </h1>
          {raffle.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {raffle.description}
            </p>
          )}
        </div>
        <Badge variant={STATUS_VARIANTS[raffle.status]}>
          {STATUS_LABELS[raffle.status]}
        </Badge>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Preco por numero: </span>
              <span className="font-medium">
                {formatCurrency(raffle.numberPrice)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Numeros: </span>
              <span className="font-medium">
                {raffle.soldNumbers}/{raffle.totalNumbers}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Progresso: </span>
              <span className="font-medium">{progress}%</span>
            </div>
            {raffle.drawDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Sorteio: </span>
                <span className="font-medium">
                  {formatDate(raffle.drawDate)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Prize */}
      {raffle.prizeDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-4 text-amber-500" />
              Premio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{raffle.prizeDescription}</p>
          </CardContent>
        </Card>
      )}

      {/* Winner / Cancelled Banners */}
      {raffle.status === 'drawn' && raffle.winnerNumber != null && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <Trophy className="size-5 shrink-0 text-amber-500" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Numero ganhador:{' '}
              {String(raffle.winnerNumber).padStart(2, '0')}
            </p>
            {raffle.winnerName && (
              <p className="text-amber-800 dark:text-amber-200">
                {raffle.winnerName}
              </p>
            )}
          </div>
        </div>
      )}
      {raffle.status === 'cancelled' && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <Info className="size-5 shrink-0 text-destructive" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-destructive">
              Esta rifa foi cancelada
            </p>
            <p className="text-muted-foreground">
              Nao e mais possivel reservar numeros.
            </p>
          </div>
        </div>
      )}

      {/* Number Grid + Reservation Panel */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Number Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isSelling ? 'Escolha seus numeros' : 'Numeros'}
              </CardTitle>
              {isSelling && (
                <CardDescription>
                  Toque nos numeros para seleciona-los.{' '}
                  {totalSelected > 0 && (
                    <span className="font-medium text-primary">
                      {totalSelected} selecionado{totalSelected > 1 ? 's' : ''}{' '}
                      — {formatCurrency(totalPrice)}
                    </span>
                  )}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
                {Array.from({ length: raffle.totalNumbers }, (_, i) => {
                  const num = i + 1
                  const isSold = soldNumbersSet.has(num)
                  const isSelected = selectedNumbers.includes(num)
                  const isWinner =
                    raffle.status === 'drawn' && raffle.winnerNumber === num

                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isClosed || isSold}
                      onClick={() => toggleNumber(num)}
                      className={cn(
                        'flex h-9 items-center justify-center rounded-md border text-xs font-medium tabular-nums transition-colors',
                        isWinner &&
                          'border-amber-400 bg-amber-100 font-bold text-amber-900 ring-2 ring-amber-400 dark:bg-amber-900/40 dark:text-amber-100',
                        !isWinner &&
                          isSold &&
                          'cursor-not-allowed border-muted bg-muted text-muted-foreground/50 line-through',
                        !isWinner &&
                          isSelected &&
                          !isSold &&
                          'border-primary bg-primary text-primary-foreground',
                        !isWinner &&
                          !isSold &&
                          !isSelected &&
                          (isClosed
                            ? 'border-border bg-background'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'),
                      )}
                    >
                      {String(num).padStart(2, '0')}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm border border-border bg-background" />
                  Disponivel
                </div>
                {isSelling && (
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm bg-primary" />
                    Selecionado
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-muted" />
                  Vendido
                </div>
                {raffle.status === 'drawn' && (
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm border-2 border-amber-400 bg-amber-100 dark:bg-amber-900/40" />
                    Ganhador
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservation Sidebar */}
        <div className="lg:col-span-2">
          {isClosed ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                {raffle.status === 'drawn' ? (
                  <>
                    <Trophy className="size-8 text-amber-500" />
                    <div>
                      <p className="font-semibold">Rifa encerrada</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Esta rifa ja foi sorteada e nao aceita novas reservas.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Info className="size-8 text-destructive" />
                    <div>
                      <p className="font-semibold">Rifa cancelada</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Esta rifa foi cancelada e nao aceita novas reservas.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : isSelling ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ticket className="size-4 text-primary" />
                  Reservar
                </CardTitle>
                <CardDescription>
                  Seus dados serao preenchidos automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buyer Info (read-only, from profile) */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Nome
                    </p>
                    <p className="text-sm font-medium">
                      {profile?.fullName ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Telefone
                    </p>
                    <p className="text-sm font-medium">
                      {profile?.phone ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Selection Summary */}
                {totalSelected > 0 && (
                  <div className="rounded-lg bg-primary/5 p-3 text-sm">
                    <p className="font-medium">
                      {totalSelected} numero{totalSelected > 1 ? 's' : ''}{' '}
                      selecionado{totalSelected > 1 ? 's' : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Numeros:{' '}
                      {selectedNumbers
                        .sort((a, b) => a - b)
                        .map((n) => String(n).padStart(2, '0'))
                        .join(', ')}
                    </p>
                    <p className="mt-1 text-base font-semibold text-primary">
                      Total: {formatCurrency(totalPrice)}
                    </p>
                  </div>
                )}

                <Button
                  size="lg"
                  disabled={isPending || totalSelected === 0}
                  className="w-full"
                  onClick={handleReserve}
                >
                  {isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {isPending ? 'Reservando...' : 'Reservar numeros'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <Info className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Rifa em rascunho</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Esta rifa ainda nao esta aberta para reservas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
