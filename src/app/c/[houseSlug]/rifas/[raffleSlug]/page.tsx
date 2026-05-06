'use client'

import { use, useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Home, Info, Loader2, Ticket, Trophy, Heart } from 'lucide-react'

import {
  raffleReservationSchema,
  type RaffleReservationFormData,
} from '@/schemas/campaign'
import {
  usePublicRaffle,
  useRaffleReservation,
} from '@/hooks/use-public'
import { formatCurrency, formatDate } from '@/utils'
import { PublicLayout } from '@/components/layout/public-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { FormField } from '@/components/forms/form-field'
import { MaskedInput } from '@/components/forms/masked-input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { DuplicateConfirmDialog } from '@/components/feedback/duplicate-confirm-dialog'

interface PageProps {
  params: Promise<{
    houseSlug: string
    raffleSlug: string
  }>
}

export default function PublicRafflePage({ params }: PageProps) {
  const { houseSlug, raffleSlug } = use(params)

  const {
    data: raffle,
    isLoading,
    isError,
    refetch,
  } = usePublicRaffle(houseSlug, raffleSlug)

  const { mutateAsync: reserveAsync, isPending } = useRaffleReservation()

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [duplicateInfo, setDuplicateInfo] = useState<{ buyerName: string; numbers: number[]; amount: number; formData: RaffleReservationFormData } | null>(null)
  const [reservationSuccess, setReservationSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RaffleReservationFormData>({
    resolver: zodResolver(raffleReservationSchema),
    defaultValues: {
      numbers: [],
      buyerName: '',
      buyerPhone: '',
      buyerDocument: '',
      buyerEmail: '',
    },
  })

  const soldNumbersSet = useMemo(() => {
    if (!raffle) return new Set<number>()
    return new Set(raffle.takenNumbers.map((t) => t.number))
  }, [raffle])

  const toggleNumber = useCallback(
    (num: number) => {
      if (soldNumbersSet.has(num) || isPending) return
      setSelectedNumbers((prev) => {
        const next = prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
        setValue('numbers', next, { shouldValidate: true })
        return next
      })
    },
    [soldNumbersSet, setValue, isPending],
  )

  async function submitReservation(data: RaffleReservationFormData, forceCreate = false) {
    if (!raffle) return
    try {
      const result = await reserveAsync({
        houseSlug, raffleSlug,
        numbers: data.numbers,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        forceCreate,
      })
      if (result.duplicate) {
        setDuplicateInfo({
          buyerName: result.existingBuyerName || data.buyerName,
          numbers: result.existingNumbers || data.numbers,
          amount: result.existingAmount || 0,
          formData: data,
        })
        return
      }
      reset()
      setSelectedNumbers([])
      setReservationSuccess(true)
      refetch()
    } catch { /* hook handles toast */ }
  }

  function onSubmit(data: RaffleReservationFormData) {
    submitReservation(data)
  }

  if (isLoading) {
    return <PublicLayout><LoadingState message="Carregando rifa..." /></PublicLayout>
  }

  if (isError || !raffle) {
    return <PublicLayout><ErrorState title="Rifa nao encontrada" message="Nao foi possivel carregar os dados da rifa." onRetry={refetch} /></PublicLayout>
  }

  const totalSelected = selectedNumbers.length
  const totalPrice = totalSelected * raffle.numberPrice
  const isClosed = raffle.status === 'drawn' || raffle.status === 'cancelled'

  return (
    <PublicLayout>
      {/* House Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/80">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <Avatar size="lg" className="border-2 border-white/30">
            {raffle.house.photoUrl && <AvatarImage src={raffle.house.photoUrl} alt={raffle.house.name} />}
            <AvatarFallback className="bg-white/20 text-white"><Home className="size-5" /></AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-primary-foreground sm:text-lg">{raffle.house.name}</p>
            <p className="text-xs text-primary-foreground/70">Organizador da rifa</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {raffle.imageUrl && (
          <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-xl">
            <Image src={raffle.imageUrl} alt={raffle.title} fill className="object-cover" priority />
          </div>
        )}

        {raffle.status === 'drawn' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
            <Trophy className="size-5 shrink-0 text-amber-500" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-100">Esta rifa ja foi sorteada!</p>
              {raffle.winnerNumber != null && <p className="text-amber-800 dark:text-amber-200">Numero ganhador: {String(raffle.winnerNumber).padStart(2, '0')}</p>}
            </div>
          </div>
        )}
        {raffle.status === 'cancelled' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <Info className="size-5 shrink-0 text-destructive" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-destructive">Esta rifa foi cancelada</p>
              <p className="text-muted-foreground">Nao e mais possivel reservar numeros.</p>
            </div>
          </div>
        )}

        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1"><Ticket className="size-3" />Rifa</Badge>
            {raffle.drawDate && <Badge variant="outline" className="gap-1"><Calendar className="size-3" />Sorteio: {formatDate(raffle.drawDate)}</Badge>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{raffle.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{raffle.description}</p>
          <p className="text-sm font-medium">Valor por numero: <span className="text-primary">{formatCurrency(raffle.numberPrice)}</span></p>
        </div>

        {raffle.prizeDescription && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="size-4 text-amber-500" />Premio</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-foreground">{raffle.prizeDescription}</p></CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Number Grid */}
          <div className="space-y-4 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isClosed ? 'Numeros' : 'Escolha seus numeros'}</CardTitle>
                {!isClosed && (
                  <CardDescription>
                    Toque nos numeros para seleciona-los.{' '}
                    {totalSelected > 0 && <span className="font-medium text-primary">{totalSelected} selecionado{totalSelected > 1 ? 's' : ''} — {formatCurrency(totalPrice)}</span>}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
                  {Array.from({ length: raffle.totalNumbers }, (_, i) => {
                    const num = i + 1
                    const isSold = soldNumbersSet.has(num)
                    const isSelected = selectedNumbers.includes(num)
                    const isWinner = raffle.status === 'drawn' && raffle.winnerNumber === num
                    return (
                      <button key={num} type="button" disabled={isClosed || isSold || isPending} onClick={() => toggleNumber(num)}
                        className={cn(
                          'flex h-9 items-center justify-center rounded-md border text-xs font-medium tabular-nums transition-colors',
                          isWinner && 'border-amber-400 bg-amber-100 font-bold text-amber-900 ring-2 ring-amber-400 dark:bg-amber-900/40 dark:text-amber-100',
                          !isWinner && isSold && 'cursor-not-allowed border-muted bg-muted text-muted-foreground/50 line-through',
                          !isWinner && isSelected && !isSold && 'border-primary bg-primary text-primary-foreground',
                          !isWinner && !isSold && !isSelected && (isClosed ? 'border-border bg-background' : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'),
                        )}
                      >
                        {String(num).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><span className="size-3 rounded-sm border border-border bg-background" />Disponivel</div>
                  {!isClosed && <div className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-primary" />Selecionado</div>}
                  <div className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-muted" />Vendido</div>
                  {raffle.status === 'drawn' && <div className="flex items-center gap-1.5"><span className="size-3 rounded-sm border-2 border-amber-400 bg-amber-100 dark:bg-amber-900/40" />Ganhador</div>}
                </div>
                {errors.numbers && <p className="mt-2 text-xs text-destructive">{errors.numbers.message}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Reservation Form */}
          <div className="lg:col-span-2">
            {reservationSuccess ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  <Heart className="size-10 text-emerald-500" />
                  <div>
                    <p className="text-base font-semibold">Reserva feita!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O administrador entrará em contato para confirmar o pagamento.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setReservationSuccess(false)}>
                    Fazer outra reserva
                  </Button>
                </CardContent>
              </Card>
            ) : isClosed ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  {raffle.status === 'drawn' ? (
                    <><Trophy className="size-8 text-amber-500" /><div><p className="font-semibold">Rifa encerrada</p><p className="mt-1 text-sm text-muted-foreground">Esta rifa ja foi sorteada.</p></div></>
                  ) : (
                    <><Info className="size-8 text-destructive" /><div><p className="font-semibold">Rifa cancelada</p><p className="mt-1 text-sm text-muted-foreground">Esta rifa foi cancelada.</p></div></>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Ticket className="size-4 text-primary" />Reservar números</CardTitle>
                  <CardDescription>Preencha seus dados para reservar. O administrador confirmará o pagamento.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {totalSelected > 0 && (
                      <div className="rounded-lg bg-primary/5 p-3 text-sm">
                        <p className="font-medium">{totalSelected} numero{totalSelected > 1 ? 's' : ''}</p>
                        <p className="text-muted-foreground">Total: {formatCurrency(totalPrice)}</p>
                      </div>
                    )}

                    <FormField label="Seu nome" name="buyerName" error={errors.buyerName}>
                      <Input id="buyerName" placeholder="Nome completo" {...register('buyerName')} />
                    </FormField>

                    <FormField label="CPF (opcional)" name="buyerDocument" error={errors.buyerDocument}>
                      <MaskedInput id="buyerDocument" mask="cpf" placeholder="000.000.000-00" {...register('buyerDocument')} />
                    </FormField>

                    <FormField label="Telefone" name="buyerPhone" error={errors.buyerPhone}>
                      <MaskedInput id="buyerPhone" mask="phone" placeholder="(00) 00000-0000" {...register('buyerPhone')} />
                    </FormField>

                    <FormField label="Email (opcional)" name="buyerEmail" error={errors.buyerEmail}>
                      <Input id="buyerEmail" type="email" placeholder="seu@email.com" {...register('buyerEmail')} />
                    </FormField>

                    <Button type="submit" size="lg" disabled={isPending || totalSelected === 0} className="w-full">
                      {isPending ? <><Loader2 className="size-4 animate-spin" />Processando...</> : <><Heart className="size-4" />Reservar números</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <DuplicateConfirmDialog
        open={!!duplicateInfo}
        onClose={() => setDuplicateInfo(null)}
        onConfirm={() => {
          if (duplicateInfo) {
            const formData = duplicateInfo.formData
            setDuplicateInfo(null)
            submitReservation(formData, true)
          }
        }}
        isPending={isPending}
        donorName={duplicateInfo?.buyerName}
        amount={duplicateInfo?.amount}
        description={`numeros ${duplicateInfo?.numbers.join(', ')}`}
      />
    </PublicLayout>
  )
}
