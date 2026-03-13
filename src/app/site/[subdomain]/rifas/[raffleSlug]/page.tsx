'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Info, Loader2, Ticket, Trophy } from 'lucide-react'

import { raffleReservationSchema, type RaffleReservationFormData } from '@/schemas/campaign'
import { useSiteContext } from '@/components/site/site-provider'
import { usePublicRaffle, useRaffleReservation } from '@/hooks/use-public'
import { formatCurrency, formatDate } from '@/utils'
import { SiteInnerLayout } from '@/components/site/site-inner-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { FormField } from '@/components/forms/form-field'
import { MaskedInput } from '@/components/forms/masked-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function SiteRafflePage() {
  const { house } = useSiteContext()
  const params = useParams()
  const raffleSlug = params.raffleSlug as string

  const { data: raffle, isLoading, isError, refetch } = usePublicRaffle(house.slug, raffleSlug)
  const { mutate: reserve, isPending } = useRaffleReservation()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<RaffleReservationFormData>({
    resolver: zodResolver(raffleReservationSchema),
    defaultValues: { numbers: [], buyerName: '', buyerPhone: '', buyerEmail: '' },
  })

  const soldNumbersSet = useMemo(() => {
    if (!raffle) return new Set<number>()
    return new Set(raffle.takenNumbers.map((t) => t.number))
  }, [raffle])

  const toggleNumber = useCallback(
    (num: number) => {
      if (soldNumbersSet.has(num)) return
      setSelectedNumbers((prev) => {
        const next = prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
        setValue('numbers', next, { shouldValidate: true })
        return next
      })
    },
    [soldNumbersSet, setValue],
  )

  function onSubmit(data: RaffleReservationFormData) {
    if (!raffle) return
    reserve(
      {
        houseSlug: house.slug,
        raffleSlug,
        numbers: data.numbers,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
      },
      {
        onSuccess: () => {
          reset()
          setSelectedNumbers([])
          refetch()
        },
      },
    )
  }

  if (isLoading) {
    return (
      <SiteInnerLayout title="Rifa">
        <LoadingState message="Carregando rifa..." />
      </SiteInnerLayout>
    )
  }

  if (isError || !raffle) {
    return (
      <SiteInnerLayout title="Rifa">
        <ErrorState title="Rifa não encontrada" message="Não foi possível carregar os dados da rifa." onRetry={refetch} />
      </SiteInnerLayout>
    )
  }

  const totalSelected = selectedNumbers.length
  const totalPrice = totalSelected * raffle.numberPrice
  const isClosed = raffle.status === 'drawn' || raffle.status === 'cancelled'

  return (
    <SiteInnerLayout title="Rifa">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {raffle.imageUrl && (
          <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-xl">
            <Image src={raffle.imageUrl} alt={raffle.title} fill className="object-cover" priority />
          </div>
        )}

        {raffle.status === 'drawn' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <Trophy className="size-5 shrink-0 text-amber-500" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Esta rifa já foi sorteada!</p>
              {raffle.winnerNumber != null && (
                <p className="text-amber-800">Número ganhador: {String(raffle.winnerNumber).padStart(2, '0')}</p>
              )}
            </div>
          </div>
        )}
        {raffle.status === 'cancelled' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <Info className="size-5 shrink-0 text-red-500" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">Esta rifa foi cancelada</p>
            </div>
          </div>
        )}

        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Ticket className="size-3" />
              Rifa
            </Badge>
            {raffle.drawDate && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="size-3" />
                Sorteio: {formatDate(raffle.drawDate)}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{raffle.title}</h1>
          <p className="text-gray-500 leading-relaxed">{raffle.description}</p>
          <p className="text-sm font-medium">
            Valor por número: <span className="text-[var(--site-primary)]">{formatCurrency(raffle.numberPrice)}</span>
          </p>
        </div>

        {raffle.prizeDescription && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="size-4 text-amber-500" />
                Prêmio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{raffle.prizeDescription}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isClosed ? 'Números' : 'Escolha seus números'}</CardTitle>
                {!isClosed && (
                  <CardDescription>
                    Toque nos números para selecioná-los.{' '}
                    {totalSelected > 0 && (
                      <span className="font-medium text-[var(--site-primary)]">
                        {totalSelected} selecionado{totalSelected > 1 ? 's' : ''} — {formatCurrency(totalPrice)}
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
                    const isWinner = raffle.status === 'drawn' && raffle.winnerNumber === num

                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={isClosed || isSold}
                        onClick={() => toggleNumber(num)}
                        className={cn(
                          'flex h-9 items-center justify-center rounded-md border text-xs font-medium tabular-nums transition-colors',
                          isWinner && 'border-amber-400 bg-amber-100 font-bold text-amber-900 ring-2 ring-amber-400',
                          !isWinner && isSold && 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through',
                          !isWinner && isSelected && !isSold && 'border-[var(--site-primary)] bg-[var(--site-primary)] text-white',
                          !isWinner && !isSold && !isSelected && (isClosed ? 'border-gray-200 bg-white' : 'border-gray-200 bg-white hover:border-[var(--site-primary)]/50 hover:bg-[var(--site-primary)]/5'),
                        )}
                      >
                        {String(num).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm border border-gray-200 bg-white" />
                    Disponível
                  </div>
                  {!isClosed && (
                    <div className="flex items-center gap-1.5">
                      <span className="size-3 rounded-sm bg-[var(--site-primary)]" />
                      Selecionado
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm bg-gray-100" />
                    Vendido
                  </div>
                  {raffle.status === 'drawn' && (
                    <div className="flex items-center gap-1.5">
                      <span className="size-3 rounded-sm border-2 border-amber-400 bg-amber-100" />
                      Ganhador
                    </div>
                  )}
                </div>

                {errors.numbers && (
                  <p className="mt-2 text-xs text-red-500">{errors.numbers.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {isClosed ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  {raffle.status === 'drawn' ? (
                    <>
                      <Trophy className="size-8 text-amber-500" />
                      <div>
                        <p className="font-semibold">Rifa encerrada</p>
                        <p className="mt-1 text-sm text-gray-500">Esta rifa já foi sorteada.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Info className="size-8 text-red-500" />
                      <div>
                        <p className="font-semibold">Rifa cancelada</p>
                        <p className="mt-1 text-sm text-gray-500">Esta rifa foi cancelada.</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Ticket className="size-4 text-[var(--site-primary)]" />
                    Reservar
                  </CardTitle>
                  <CardDescription>Preencha seus dados para reservar</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {totalSelected > 0 && (
                      <div className="rounded-lg bg-[var(--site-primary)]/5 p-3 text-sm">
                        <p className="font-medium">{totalSelected} número{totalSelected > 1 ? 's' : ''}</p>
                        <p className="text-gray-500">Total: {formatCurrency(totalPrice)}</p>
                      </div>
                    )}

                    <FormField label="Seu nome" name="buyerName" error={errors.buyerName}>
                      <Input id="buyerName" placeholder="Nome completo" {...register('buyerName')} />
                    </FormField>

                    <FormField label="Telefone" name="buyerPhone" error={errors.buyerPhone}>
                      <MaskedInput id="buyerPhone" mask="phone" placeholder="(00) 00000-0000" {...register('buyerPhone')} />
                    </FormField>

                    <FormField label="Email (opcional)" name="buyerEmail" error={errors.buyerEmail}>
                      <Input id="buyerEmail" type="email" placeholder="seu@email.com" {...register('buyerEmail')} />
                    </FormField>

                    <Button type="submit" size="lg" disabled={isPending || totalSelected === 0} className="w-full">
                      {isPending && <Loader2 className="size-4 animate-spin" />}
                      {isPending ? 'Reservando...' : 'Reservar números'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SiteInnerLayout>
  )
}
