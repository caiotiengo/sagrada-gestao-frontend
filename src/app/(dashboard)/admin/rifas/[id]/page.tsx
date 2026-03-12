'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Phone, CheckCircle2, Clock, Dices, Search } from 'lucide-react'
import {
  useRaffleDetails,
  useRaffleReservations,
  useConfirmRafflePayment,
  useDrawRaffle,
} from '@/hooks/use-raffles'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDate } from '@/utils'
import type { RaffleReservationItem, RaffleStatus } from '@/types'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const STATUS_LABELS: Record<RaffleStatus, string> = {
  draft: 'Rascunho',
  selling: 'Vendendo',
  drawn: 'Sorteada',
  cancelled: 'Cancelada',
}

const STATUS_VARIANTS: Record<RaffleStatus, 'default' | 'secondary' | 'destructive' | 'outline'> =
  {
    draft: 'secondary',
    selling: 'default',
    drawn: 'outline',
    cancelled: 'destructive',
  }

function formatNumber(n: number) {
  return String(n).padStart(2, '0')
}

export default function AdminRaffleDetailPage() {
  const params = useParams()
  const raffleId = params.id as string
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageRaffles'))

  const [pendingPage, setPendingPage] = useState(1)
  const [paidPage, setPaidPage] = useState(1)
  const [reservationSearch, setReservationSearch] = useState('')
  const [redrawOpen, setRedrawOpen] = useState(false)

  const { data: raffle, isLoading, isError, refetch } = useRaffleDetails(raffleId)
  const pendingQuery = useRaffleReservations(raffleId, pendingPage, false)
  const paidQuery = useRaffleReservations(raffleId, paidPage, true)
  const confirmPayment = useConfirmRafflePayment()
  const drawRaffle = useDrawRaffle()

  const allPendingReservations = pendingQuery.data?.data ?? []
  const pendingTotalPages = pendingQuery.data?.pagination.totalPages ?? 1
  const allPaidReservations = paidQuery.data?.data ?? []
  const paidTotalPages = paidQuery.data?.pagination.totalPages ?? 1

  const pendingReservations = useMemo(() => {
    if (!reservationSearch.trim()) return allPendingReservations
    const query = reservationSearch.toLowerCase()
    return allPendingReservations.filter((r) =>
      r.buyerName.toLowerCase().includes(query) ||
      r.buyerPhone.includes(query),
    )
  }, [allPendingReservations, reservationSearch])

  const paidReservations = useMemo(() => {
    if (!reservationSearch.trim()) return allPaidReservations
    const query = reservationSearch.toLowerCase()
    return allPaidReservations.filter((r) =>
      r.buyerName.toLowerCase().includes(query) ||
      r.buyerPhone.includes(query),
    )
  }, [allPaidReservations, reservationSearch])

  if (isLoading) {
    return <LoadingState message="Carregando detalhes da rifa..." />
  }

  if (isError || !raffle) {
    return (
      <ErrorState
        title="Erro ao carregar rifa"
        message="Não foi possível carregar os detalhes desta rifa."
        onRetry={() => refetch()}
      />
    )
  }

  const progress =
    raffle.totalNumbers > 0
      ? Math.round((raffle.soldNumbers / raffle.totalNumbers) * 100)
      : 0

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Back Button */}
      <Link href={ROUTES.ADMIN_RAFFLES}>
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
          <p className="mt-1 text-sm text-muted-foreground">
            {raffle.prizeDescription}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[raffle.status]}>
          {STATUS_LABELS[raffle.status]}
        </Badge>
      </div>

      {/* Info Row */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Preço por número: </span>
              <span className="font-medium">{formatCurrency(raffle.numberPrice)}</span>
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
              <div>
                <span className="text-muted-foreground">Sorteio: </span>
                <span className="font-medium">{formatDate(raffle.drawDate)}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Criada em: </span>
              <span className="font-medium">{formatDate(raffle.createdAt)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winner Display */}
      {raffle.status === 'drawn' && raffle.winnerNumber != null && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <Trophy className="size-5 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Ganhador: Numero {formatNumber(raffle.winnerNumber)}
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              {raffle.winnerName ?? ''}
            </p>
          </div>
          {canManage && (
            <AlertDialog open={redrawOpen} onOpenChange={setRedrawOpen}>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="sm" className="shrink-0 gap-2">
                    <Dices className="size-4" />
                    Sortear novamente
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refazer sorteio?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Um novo número será sorteado, substituindo o ganhador atual.
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (!houseId) return
                      drawRaffle.mutate(
                        { houseId, raffleId },
                        {
                          onSuccess: () => {
                            setRedrawOpen(false)
                            refetch()
                          },
                        },
                      )
                    }}
                    disabled={drawRaffle.isPending}
                  >
                    {drawRaffle.isPending ? 'Sorteando...' : 'Confirmar sorteio'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={reservationSearch}
          onChange={(e) => setReservationSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Reservations Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="paid">Pagas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="mt-3 space-y-3">
            {pendingQuery.isLoading ? (
              <LoadingState message="Carregando reservas..." />
            ) : pendingReservations.length > 0 ? (
              <>
                {pendingReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    houseId={houseId}
                    confirmPayment={confirmPayment}
                    showConfirm={canManage}
                  />
                ))}
                <Pagination
                  page={pendingPage}
                  totalPages={pendingTotalPages}
                  onPageChange={setPendingPage}
                />
              </>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Nenhuma reserva pendente"
                description="Todas as reservas foram pagas ou não há reservas."
                className="min-h-[20dvh]"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="paid">
          <div className="mt-3 space-y-3">
            {paidQuery.isLoading ? (
              <LoadingState message="Carregando reservas..." />
            ) : paidReservations.length > 0 ? (
              <>
                {paidReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    houseId={houseId}
                    confirmPayment={confirmPayment}
                  />
                ))}
                <Pagination
                  page={paidPage}
                  totalPages={paidTotalPages}
                  onPageChange={setPaidPage}
                />
              </>
            ) : (
              <EmptyState
                icon={Clock}
                title="Nenhuma reserva paga"
                description="Nenhuma reserva foi confirmada ainda."
                className="min-h-[20dvh]"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReservationCard({
  reservation,
  houseId,
  confirmPayment,
  showConfirm,
}: {
  reservation: RaffleReservationItem
  houseId?: string | null
  confirmPayment: ReturnType<typeof useConfirmRafflePayment>
  showConfirm?: boolean
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{reservation.buyerName}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="size-3.5" />
              <span>{reservation.buyerPhone}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(reservation.totalAmount)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(reservation.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {reservation.numbers.map((n) => (
            <span
              key={n}
              className="inline-flex size-8 items-center justify-center rounded-md bg-muted text-xs font-medium"
            >
              {formatNumber(n)}
            </span>
          ))}
        </div>

        {showConfirm && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" className="w-full gap-2">
                  <CheckCircle2 className="size-4" />
                  Confirmar Pagamento
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar pagamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja confirmar o pagamento de {formatCurrency(reservation.totalAmount)} de{' '}
                  {reservation.buyerName}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (!houseId) return
                    confirmPayment.mutate({
                      houseId,
                      reservationId: reservation.id,
                    })
                  }}
                  disabled={confirmPayment.isPending}
                >
                  {confirmPayment.isPending ? 'Confirmando...' : 'Confirmar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próximo
      </Button>
    </div>
  )
}
