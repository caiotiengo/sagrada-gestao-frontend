'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Phone, CheckCircle2, Clock, Dices, Search, Trash2 } from 'lucide-react'
import {
  useRaffleDetails,
  useRaffleReservations,
  useConfirmRafflePayment,
  useDrawRaffle,
  useDeleteRaffleReservation,
} from '@/hooks/use-raffles'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '@/utils'
import { todayBRT } from '@/utils/dates'
import { PAYMENT_METHOD_LABELS } from '@/constants'
import { DateInput } from '@/components/forms/date-input'
import type { PaymentMethod } from '@/types'
import type { RaffleReservationItem, RaffleStatus } from '@/types'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  const [drawOpen, setDrawOpen] = useState(false)

  const { data: raffle, isLoading, isError, refetch } = useRaffleDetails(raffleId)
  const pendingQuery = useRaffleReservations(raffleId, pendingPage, false)
  const paidQuery = useRaffleReservations(raffleId, paidPage, true)
  const confirmPayment = useConfirmRafflePayment()
  const drawRaffle = useDrawRaffle()
  const deleteReservation = useDeleteRaffleReservation()

  const allPendingReservations = useMemo(() => pendingQuery.data?.data ?? [], [pendingQuery.data])
  const pendingTotalPages = pendingQuery.data?.pagination.totalPages ?? 1
  const allPaidReservations = useMemo(() => paidQuery.data?.data ?? [], [paidQuery.data])
  const paidTotalPages = paidQuery.data?.pagination.totalPages ?? 1

  const pendingReservations = useMemo(() => {
    if (!reservationSearch.trim()) return allPendingReservations
    const query = reservationSearch.toLowerCase()
    return allPendingReservations.filter((r) =>
      r.buyerName.toLowerCase().includes(query) ||
      (r.buyerPhone ?? '').includes(query),
    )
  }, [allPendingReservations, reservationSearch])

  const paidReservations = useMemo(() => {
    if (!reservationSearch.trim()) return allPaidReservations
    const query = reservationSearch.toLowerCase()
    return allPaidReservations.filter((r) =>
      r.buyerName.toLowerCase().includes(query) ||
      (r.buyerPhone ?? '').includes(query),
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

  // Só números pagos entram no sorteio; reservas pendentes ficam de fora.
  const paidCount = raffle.numbers.filter((n) => n.isPaid).length
  const pendingCount = raffle.numbers.length - paidCount

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
              <span className="text-muted-foreground">Números: </span>
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

      {/* Sorteio: só uma vez, entre os números pagos */}
      {canManage && raffle.status === 'selling' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <div className="text-sm">
            <p className="font-medium">{paidCount} número(s) pago(s) concorrem ao sorteio</p>
            {pendingCount > 0 && (
              <p className="text-muted-foreground">
                {pendingCount} número(s) reservado(s) sem pagamento ficam de fora
              </p>
            )}
          </div>
          <AlertDialog open={drawOpen} onOpenChange={setDrawOpen}>
            <AlertDialogTrigger
              render={
                <Button size="sm" className="shrink-0 gap-2" disabled={paidCount === 0}>
                  <Dices className="size-4" />
                  Sortear
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Realizar sorteio?</AlertDialogTitle>
                <AlertDialogDescription>
                  Concorrem {paidCount} número(s) pago(s).
                  {pendingCount > 0 && ` ${pendingCount} número(s) com pagamento pendente não participam.`}{' '}
                  O sorteio é feito uma única vez e não pode ser refeito.
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
                        onSettled: () => {
                          setDrawOpen(false)
                          refetch()
                        },
                      },
                    )
                  }}
                  disabled={drawRaffle.isPending || paidCount === 0}
                >
                  {drawRaffle.isPending ? 'Sorteando...' : 'Confirmar sorteio'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Winner Display */}
      {raffle.status === 'drawn' && raffle.winnerNumber != null && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <Trophy className="size-5 shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Ganhador: Número {formatNumber(raffle.winnerNumber)}
              </p>
              <p className="text-amber-800 dark:text-amber-200">
                {raffle.winnerName ?? ''}
              </p>
            </div>
          </div>
          {raffle.draw && (
            <div className="space-y-0.5 border-t border-amber-200 pt-2 text-xs text-amber-900/80 dark:border-amber-900 dark:text-amber-100/80">
              <p className="font-medium">Auditoria do sorteio</p>
              {raffle.drawnAt && <p>Sorteado em: {formatDateTime(raffle.drawnAt)}</p>}
              <p>Números elegíveis (pagos): {raffle.draw.eligibleCount}</p>
              <p>Posição sorteada: {raffle.draw.winnerIndex + 1}º da lista de elegíveis</p>
              <p className="break-all">Semente: <span className="font-mono">{raffle.draw.seed}</span></p>
              <p className="break-all">Hash dos elegíveis: <span className="font-mono">{raffle.draw.eligibleHash}</span></p>
            </div>
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
                    deleteReservation={deleteReservation}
                    canManage={canManage}
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
                    deleteReservation={deleteReservation}
                    canManage={canManage}
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
  deleteReservation,
  canManage,
  showConfirm,
}: {
  reservation: RaffleReservationItem
  houseId?: string | null
  confirmPayment: ReturnType<typeof useConfirmRafflePayment>
  deleteReservation: ReturnType<typeof useDeleteRaffleReservation>
  canManage?: boolean
  showConfirm?: boolean
}) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [paidAt, setPaidAt] = useState(todayBRT())
  const paidAtInvalid = !paidAt || paidAt > todayBRT()

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{reservation.buyerName}</p>
            {reservation.buyerPhone && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5" />
                <span>{formatPhone(reservation.buyerPhone)}</span>
              </div>
            )}
            {(reservation.source || (!reservation.isPaid && reservation.expiresAt)) && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {reservation.source && (
                  <Badge variant="outline" className="text-[0.65rem]">
                    {reservation.source === 'public' ? 'Página pública' : 'Interna'}
                  </Badge>
                )}
                {!reservation.isPaid && reservation.expiresAt && (
                  <span className="text-xs text-muted-foreground">
                    expira em {formatDateTime(reservation.expiresAt)}
                  </span>
                )}
              </div>
            )}
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

        <div className="flex gap-2">
          {showConfirm && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button size="sm" className="flex-1 gap-2">
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium" htmlFor={`method-${reservation.id}`}>Forma de pagamento</label>
                    <select
                      id={`method-${reservation.id}`}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={method}
                      onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    >
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" htmlFor={`paid-at-${reservation.id}`}>Data do pagamento</label>
                    <DateInput id={`paid-at-${reservation.id}`} value={paidAt} onValueChange={setPaidAt} />
                    {paidAt > todayBRT() && (
                      <p className="text-xs text-destructive">Não pode ser no futuro</p>
                    )}
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (!houseId) return
                      confirmPayment.mutate({
                        houseId,
                        reservationId: reservation.id,
                        paymentMethod: method,
                        paidAt,
                      })
                    }}
                    disabled={confirmPayment.isPending || paidAtInvalid}
                  >
                    {confirmPayment.isPending ? 'Confirmando...' : 'Confirmar'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteAlertOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Excluir
            </Button>
          )}
        </div>

        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
              <AlertDialogDescription>
                A reserva de {reservation.buyerName} ({reservation.numbers.length} números, {formatCurrency(reservation.totalAmount)}) será excluída permanentemente e os números serão liberados.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (!houseId) return
                  deleteReservation.mutate(
                    { houseId, reservationId: reservation.id },
                    { onSuccess: () => setDeleteAlertOpen(false) },
                  )
                }}
                disabled={deleteReservation.isPending}
              >
                {deleteReservation.isPending ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
