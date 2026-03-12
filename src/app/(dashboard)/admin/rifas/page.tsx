'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Ticket, Plus, Share2, Trophy, Dices, Ban, MoreVertical, Search } from 'lucide-react'
import { useRaffles, useCreateRaffle, useDrawRaffle, useDeleteRaffle } from '@/hooks/use-raffles'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/utils'
import type { RaffleItem, RaffleStatus } from '@/types'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/forms/currency-input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

export default function AdminRafflesPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const houseSlug = useAuthStore((s) => s.currentHouse?.houseSlug)
  const canManage = useAuthStore((s) => s.hasPermission('canManageRaffles'))

  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prizeDescription, setPrizeDescription] = useState('')
  const [numberPrice, setNumberPrice] = useState(0)
  const [totalNumbers, setTotalNumbers] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const { data, isLoading, isError, refetch } = useRaffles(page)
  const createRaffle = useCreateRaffle()

  const raffles = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  const [search, setSearch] = useState('')

  const filteredRaffles = useMemo(() => {
    if (!search.trim()) return raffles
    const query = search.toLowerCase()
    return raffles.filter((r) =>
      r.title.toLowerCase().includes(query) ||
      r.prizeDescription.toLowerCase().includes(query),
    )
  }, [raffles, search])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPrizeDescription('')
    setNumberPrice(0)
    setTotalNumbers('')
    setIsPublic(true)
  }

  const handleCreate = () => {
    if (!houseId || !title.trim() || !description.trim() || !prizeDescription.trim()) return

    const total = parseInt(totalNumbers, 10)

    if (numberPrice <= 0 || isNaN(total) || total <= 0) return

    createRaffle.mutate(
      {
        houseId,
        title: title.trim(),
        description: description.trim(),
        prizeDescription: prizeDescription.trim(),
        numberPrice,
        totalNumbers: total,
        isPublic,
      },
      {
        onSettled: (_, error) => {
          if (!error) {
            resetForm()
            setDialogOpen(false)
          }
        },
      },
    )
  }

  const formValid =
    title.trim() &&
    description.trim() &&
    prizeDescription.trim() &&
    numberPrice > 0 &&
    totalNumbers &&
    parseInt(totalNumbers, 10) > 0

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar rifas"
        message="Não foi possível carregar a lista de rifas. Tente novamente."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Rifas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as rifas da sua casa
          </p>
        </div>

        {canManage && <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-1.5 size-4" />
            <span className="hidden sm:inline">Nova Rifa</span>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Rifa</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova rifa.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Ex: Rifa Beneficente"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva a rifa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descrição do prêmio</label>
                <Input
                  placeholder="Ex: Cesta de chocolate"
                  value={prizeDescription}
                  onChange={(e) => setPrizeDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Preço por número (R$)</label>
                  <CurrencyInput
                    value={numberPrice}
                    onValueChange={setNumberPrice}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Total de números</label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="100"
                    value={totalNumbers}
                    onChange={(e) => setTotalNumbers(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Rifa pública (visível para qualquer pessoa)
                </label>
              </div>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button
                onClick={handleCreate}
                disabled={!formValid || createRaffle.isPending}
              >
                {createRaffle.isPending ? 'Criando...' : 'Criar Rifa'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título ou prêmio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Raffles List with Tabs */}
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : filteredRaffles.length > 0 ? (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Em andamento</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {(() => {
              const active = filteredRaffles.filter((r) => r.status !== 'cancelled')
              return active.length > 0 ? (
                <div className="space-y-3">
                  {active.map((raffle) => (
                    <RaffleCard key={raffle.id} raffle={raffle} houseSlug={houseSlug} houseId={houseId} canManage={canManage} onDrawSuccess={refetch} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="Nenhuma rifa em andamento"
                  description="Todas as rifas foram canceladas ou sorteadas."
                  className="min-h-[30dvh]"
                />
              )
            })()}
          </TabsContent>

          <TabsContent value="cancelled">
            {(() => {
              const cancelled = filteredRaffles.filter((r) => r.status === 'cancelled')
              return cancelled.length > 0 ? (
                <div className="space-y-3">
                  {cancelled.map((raffle) => (
                    <RaffleCard key={raffle.id} raffle={raffle} houseSlug={houseSlug} houseId={houseId} canManage={canManage} onDrawSuccess={refetch} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="Nenhuma rifa cancelada"
                  description="Nenhuma rifa foi cancelada até o momento."
                  className="min-h-[30dvh]"
                />
              )
            })()}
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState
          icon={Ticket}
          title="Nenhuma rifa cadastrada"
          description="Crie sua primeira rifa clicando no botão acima."
          className="min-h-[30dvh]"
        />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}

function RaffleCard({
  raffle,
  houseSlug,
  houseId,
  canManage,
  onDrawSuccess,
}: {
  raffle: RaffleItem
  houseSlug?: string | null
  houseId?: string | null
  canManage?: boolean
  onDrawSuccess?: () => void
}) {
  const drawRaffle = useDrawRaffle()
  const deleteRaffle = useDeleteRaffle()
  const [drawResult, setDrawResult] = useState<{ winnerNumber: number; winnerName: string } | null>(null)
  const [drawAlertOpen, setDrawAlertOpen] = useState(false)
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false)

  const progress =
    raffle.totalNumbers > 0
      ? Math.round((raffle.soldNumbers / raffle.totalNumbers) * 100)
      : 0

  const handleShare = () => {
    if (!houseSlug || !raffle.slug) return
    const link = `${window.location.origin}${ROUTES.PUBLIC_RAFFLE(houseSlug, raffle.slug)}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  const handleDraw = () => {
    if (!houseId) return
    drawRaffle.mutate(
      { houseId, raffleId: raffle.id },
      {
        onSuccess: (data) => {
          setDrawResult({ winnerNumber: data.winnerNumber, winnerName: data.winnerName })
          onDrawSuccess?.()
        },
      },
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-4">
        {/* Title + Badge */}
        <div className="flex items-start justify-between gap-2">
          <Link href={ROUTES.ADMIN_RAFFLE_DETAIL(raffle.id)} className="min-w-0 flex-1 group/link">
            <h3 className="text-sm font-semibold group-hover/link:underline sm:text-base">{raffle.title}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
              {raffle.prizeDescription}
            </p>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant={STATUS_VARIANTS[raffle.status]} className="shrink-0">
              {STATUS_LABELS[raffle.status]}
            </Badge>
            {canManage && raffle.status !== 'cancelled' && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()} />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {raffle.isPublic && houseSlug && raffle.slug && (
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="size-4" />
                      Compartilhar
                    </DropdownMenuItem>
                  )}
                  {raffle.soldNumbers > 0 && (raffle.status === 'selling' || raffle.status === 'drawn') && (
                    <DropdownMenuItem onClick={() => setDrawAlertOpen(true)}>
                      <Dices className="size-4" />
                      {raffle.status === 'drawn' || drawResult ? 'Sortear novamente' : 'Sortear'}
                    </DropdownMenuItem>
                  )}
                  {(raffle.status !== 'drawn' && !drawResult) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setCancelAlertOpen(true)}>
                        <Ban className="size-4" />
                        Cancelar rifa
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Winner result */}
        {(raffle.status === 'drawn' || drawResult) && (
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
            <Trophy className="size-4 shrink-0 text-amber-500" />
            <div className="min-w-0 text-xs sm:text-sm">
              <span className="font-semibold text-amber-900 dark:text-amber-100">
                Nº {String(drawResult?.winnerNumber ?? raffle.winnerNumber ?? 0).padStart(2, '0')}
              </span>
              <span className="text-amber-800 dark:text-amber-200">
                {' — '}{drawResult?.winnerName ?? raffle.winnerName ?? ''}
              </span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{raffle.soldNumbers}/{raffle.totalNumbers} números</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatCurrency(raffle.numberPrice)}/nº</span>
          {raffle.drawDate && <span>Sorteio: {formatDate(raffle.drawDate)}</span>}
          <span>Criada: {formatDate(raffle.createdAt)}</span>
        </div>

        {/* Draw Alert Dialog (controlled) */}
        <AlertDialog open={drawAlertOpen} onOpenChange={setDrawAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {raffle.status === 'drawn' || drawResult ? 'Refazer sorteio?' : 'Realizar sorteio?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {raffle.status === 'drawn' || drawResult
                  ? 'Um novo número será sorteado, substituindo o ganhador atual. Esta ação não pode ser desfeita.'
                  : 'O sorteio será realizado entre os números reservados. Esta ação não pode ser desfeita.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDraw}
                disabled={drawRaffle.isPending}
              >
                {drawRaffle.isPending ? 'Sorteando...' : 'Confirmar sorteio'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Alert Dialog (controlled) */}
        <AlertDialog open={cancelAlertOpen} onOpenChange={setCancelAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar rifa?</AlertDialogTitle>
              <AlertDialogDescription>
                A rifa será cancelada e não poderá mais receber vendas.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (!houseId) return
                  deleteRaffle.mutate(
                    { houseId, raffleId: raffle.id },
                    { onSuccess: () => onDrawSuccess?.() },
                  )
                }}
                disabled={deleteRaffle.isPending}
              >
                {deleteRaffle.isPending ? 'Cancelando...' : 'Confirmar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
