'use client'

import { use, useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Home, Info, Loader2, Ticket, Trophy, QrCode, HandCoins, Copy, CheckCircle2, Heart } from 'lucide-react'

import {
  raffleReservationSchema,
  type RaffleReservationFormData,
} from '@/schemas/campaign'
import {
  usePublicRaffle,
  useRaffleReservation,
  useRaffleReservationWithPix,
  useReservationStatus,
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
import { PixCountdown } from '@/components/pix/pix-countdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{
    houseSlug: string
    raffleSlug: string
  }>
}

interface PixPaymentData {
  reservationId: string
  amount: number
  pixEmv: string
  startedAt: number
}

export default function PublicRafflePage({ params }: PageProps) {
  const { houseSlug, raffleSlug } = use(params)

  const {
    data: raffle,
    isLoading,
    isError,
    refetch,
  } = usePublicRaffle(houseSlug, raffleSlug)

  const { mutateAsync: reserveAsync, isPending: isPendingReserve } = useRaffleReservation()
  const { mutateAsync: reservePixAsync, isPending: isPendingPix } = useRaffleReservationWithPix()
  const isPending = isPendingReserve || isPendingPix

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [duplicateInfo, setDuplicateInfo] = useState<{ buyerName: string; numbers: number[]; amount: number; formData: RaffleReservationFormData } | null>(null)
  const [pixData, setPixData] = useState<PixPaymentData | null>(null)
  const [copied, setCopied] = useState(false)
  const [paymentChoiceOpen, setPaymentChoiceOpen] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<RaffleReservationFormData | null>(null)
  const [lastPaymentChoice, setLastPaymentChoice] = useState<'pix' | 'later' | null>(null)

  // Poll reservation status when PIX is shown
  const { data: statusData } = useReservationStatus(pixData?.reservationId ?? null)

  useEffect(() => {
    if (statusData?.isPaid && pixData) {
      setPixData(null)
      setSelectedNumbers([])
      refetch()
      toast.success('Pagamento confirmado! Numeros reservados com sucesso.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusData?.isPaid, pixData])

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

  const isProcessing = isPending || !!pixData

  const toggleNumber = useCallback(
    (num: number) => {
      if (soldNumbersSet.has(num) || isProcessing) return
      setSelectedNumbers((prev) => {
        const next = prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
        setValue('numbers', next, { shouldValidate: true })
        return next
      })
    },
    [soldNumbersSet, setValue, isProcessing],
  )

  const copyPixCode = useCallback(async () => {
    if (!pixData?.pixEmv) return
    try {
      await navigator.clipboard.writeText(pixData.pixEmv)
      setCopied(true)
      toast.success('Codigo PIX copiado!')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Erro ao copiar')
    }
  }, [pixData?.pixEmv])

  async function submitWithPix(data: RaffleReservationFormData, forceCreate = false) {
    if (!raffle) return
    if (!data.buyerDocument || data.buyerDocument.replace(/\D/g, '').length < 11) {
      toast.error('CPF e obrigatorio para pagamento via PIX')
      return
    }
    try {
      const result = await reservePixAsync({
        houseSlug, raffleSlug,
        numbers: data.numbers,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        buyerDocument: data.buyerDocument,
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
      if (result.pix?.emv) {
        setPixData({
          reservationId: result.reservationId,
          amount: result.totalAmount,
          pixEmv: result.pix.emv,
          startedAt: Date.now(),
        })
      }
    } catch { /* hook handles toast */ }
  }

  async function submitPayLater(data: RaffleReservationFormData, forceCreate = false) {
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
      refetch()
    } catch { /* hook handles toast */ }
  }

  function onSubmit(data: RaffleReservationFormData) {
    setPendingFormData(data)
    setPaymentChoiceOpen(true)
  }

  function handlePaymentChoice(choice: 'pix' | 'later') {
    if (!pendingFormData || !raffle) return
    const total = pendingFormData.numbers.length * raffle.numberPrice
    if (choice === 'pix' && total < 5) {
      toast.error('Valor minimo para pagamento via PIX e R$ 5,00')
      return
    }
    setPaymentChoiceOpen(false)
    setLastPaymentChoice(choice)
    if (choice === 'pix') submitWithPix(pendingFormData)
    else submitPayLater(pendingFormData)
    setPendingFormData(null)
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
                      <button key={num} type="button" disabled={isClosed || isSold || isProcessing} onClick={() => toggleNumber(num)}
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

          {/* PIX Screen OR Reservation Form */}
          <div className="lg:col-span-2">
            {pixData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><QrCode className="size-4 text-primary" />Pagar com PIX</CardTitle>
                  <CardDescription>Copie o codigo e pague no app do seu banco</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/50 p-4 text-center">
                    <p className="mb-1 text-2xl font-bold text-primary">{formatCurrency(pixData.amount)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Codigo PIX (Copia e Cola)</p>
                    <div className="max-h-20 overflow-y-auto rounded-md border bg-muted/30 p-3 text-xs break-all font-mono">{pixData.pixEmv}</div>
                    <Button onClick={copyPixCode} variant={copied ? 'default' : 'outline'} className="w-full" size="lg">
                      {copied ? <><CheckCircle2 className="size-4" />Copiado!</> : <><Copy className="size-4" />Copiar codigo PIX</>}
                    </Button>
                  </div>
                  <PixCountdown
                    startedAt={pixData.startedAt}
                    onExpired={() => {
                      setPixData(null)
                      setSelectedNumbers([])
                      toast.info('PIX expirado. Sua reserva foi registrada para pagamento posterior.')
                    }}
                  />
                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { setPixData(null); reset(); setSelectedNumbers([]) }}>
                    Voltar ao formulario
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
                  <CardTitle className="flex items-center gap-2 text-lg"><Ticket className="size-4 text-primary" />Reservar</CardTitle>
                  <CardDescription>Preencha seus dados para reservar</CardDescription>
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

                    <FormField label="CPF" name="buyerDocument" error={errors.buyerDocument}>
                      <MaskedInput id="buyerDocument" mask="cpf" placeholder="000.000.000-00" {...register('buyerDocument')} />
                    </FormField>

                    <FormField label="Telefone" name="buyerPhone" error={errors.buyerPhone}>
                      <MaskedInput id="buyerPhone" mask="phone" placeholder="(00) 00000-0000" {...register('buyerPhone')} />
                    </FormField>

                    <FormField label="Email (opcional)" name="buyerEmail" error={errors.buyerEmail}>
                      <Input id="buyerEmail" type="email" placeholder="seu@email.com" {...register('buyerEmail')} />
                    </FormField>

                    <Button type="submit" size="lg" disabled={isPending || totalSelected === 0} className="w-full">
                      {isPending ? <><Loader2 className="size-4 animate-spin" />Processando...</> : <><Heart className="size-4" />Reservar numeros</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Choice Dialog */}
      <Dialog open={paymentChoiceOpen} onOpenChange={setPaymentChoiceOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pb-5 pt-6 text-primary-foreground">
            <p className="text-sm font-medium text-primary-foreground/70">Sua reserva</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {pendingFormData ? formatCurrency(pendingFormData.numbers.length * (raffle?.numberPrice ?? 0)) : ''}
            </p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              {pendingFormData?.numbers.length} numero{(pendingFormData?.numbers.length ?? 0) > 1 ? 's' : ''} — {pendingFormData?.buyerName}
            </p>
          </div>
          <div className="px-6 pb-6 pt-4">
            <p className="mb-4 text-sm font-medium text-foreground">Como deseja pagar?</p>
            <div className="space-y-3">
              <button type="button" className="flex w-full items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/10 disabled:opacity-50" onClick={() => handlePaymentChoice('pix')} disabled={isPending}>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"><QrCode className="size-6 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Pagar agora com PIX</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Gere o codigo PIX e pague na hora pelo app do banco</p>
                </div>
              </button>
              <button type="button" className="flex w-full items-center gap-4 rounded-xl border-2 border-muted p-4 text-left transition-all hover:border-muted-foreground/30 hover:bg-muted/50 disabled:opacity-50" onClick={() => handlePaymentChoice('later')} disabled={isPending}>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted"><HandCoins className="size-6 text-muted-foreground" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Pagar depois</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Reserve os numeros e combine o pagamento</p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DuplicateConfirmDialog
        open={!!duplicateInfo}
        onClose={() => setDuplicateInfo(null)}
        onConfirm={() => {
          if (duplicateInfo) {
            const formData = duplicateInfo.formData
            setDuplicateInfo(null)
            if (lastPaymentChoice === 'pix') submitWithPix(formData, true)
            else if (lastPaymentChoice === 'later') submitPayLater(formData, true)
            else {
              setPendingFormData({ ...formData })
              setPaymentChoiceOpen(true)
            }
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
