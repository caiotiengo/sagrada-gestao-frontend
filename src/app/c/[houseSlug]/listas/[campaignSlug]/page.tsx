'use client'

import { use } from 'react'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useCallback } from 'react'
import { Heart, Home, Info, Loader2, Target, CheckCircle2, Copy, QrCode, Clock, HandCoins } from 'lucide-react'

import {
  campaignContributionSchema,
  type CampaignContributionFormData,
} from '@/schemas/campaign'
import {
  usePublicCampaign,
  useCampaignContribute,
  useCampaignContributeWithPix,
  useContributionStatus,
} from '@/hooks/use-public'
import { formatCurrency } from '@/utils'
import { PublicLayout } from '@/components/layout/public-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { FormField } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/forms/currency-input'
import { MaskedInput } from '@/components/forms/masked-input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    campaignSlug: string
  }>
}

interface PixPaymentData {
  contributionId: string
  amount: number
  pixEmv: string
  bankSlipUrl?: string
  startedAt: number
}

export default function PublicCampaignPage({ params }: PageProps) {
  const { houseSlug, campaignSlug } = use(params)

  const {
    data: campaign,
    isLoading,
    isError,
    refetch,
  } = usePublicCampaign(houseSlug, campaignSlug)

  const { mutateAsync: contributeAsync, isPending: isPendingContribute } = useCampaignContribute()
  const { mutateAsync: contributePixAsync, isPending: isPendingPix } = useCampaignContributeWithPix()
  const isPending = isPendingContribute || isPendingPix

  const [duplicateInfo, setDuplicateInfo] = useState<{ donorName: string; amount: number; formData: CampaignContributionFormData } | null>(null)
  const [pixData, setPixData] = useState<PixPaymentData | null>(null)
  const [copied, setCopied] = useState(false)
  const [paymentChoiceOpen, setPaymentChoiceOpen] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<CampaignContributionFormData | null>(null)
  const [pendingForceCreate, setPendingForceCreate] = useState(false)
  const [lastPaymentChoice, setLastPaymentChoice] = useState<'pix' | 'later' | null>(null)

  // Poll contribution status when PIX is shown
  const { data: statusData } = useContributionStatus(pixData?.contributionId ?? null)

  // When payment confirmed, show success
  useEffect(() => {
    if (statusData?.isPaid && pixData) {
      setPixData(null)
      refetch()
      toast.success('Pagamento confirmado! Obrigado pela contribuicao.')
    }
  }, [statusData?.isPaid, pixData, refetch])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CampaignContributionFormData>({
    resolver: zodResolver(campaignContributionSchema),
    defaultValues: {
      amount: 0,
      donorName: '',
      donorPhone: '',
      donorDocument: '',
      donorEmail: '',
      message: '',
    },
  })

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

  // Submit with PIX
  async function submitWithPix(data: CampaignContributionFormData, forceCreate = false) {
    if (!campaign) return
    if (!data.donorDocument || data.donorDocument.replace(/\D/g, '').length < 11) {
      toast.error('CPF e obrigatorio para pagamento via PIX')
      return
    }
    try {
      const result = await contributePixAsync({
        houseSlug,
        campaignSlug,
        donorName: data.donorName,
        donorPhone: data.donorPhone,
        donorDocument: data.donorDocument,
        amount: data.amount,
        message: data.message || undefined,
        forceCreate,
      })

      if (result.duplicate) {
        setDuplicateInfo({
          donorName: result.existingDonorName || data.donorName,
          amount: result.existingAmount || data.amount,
          formData: data,
        })
        return
      }

      if (result.pix?.emv) {
        setPixData({
          contributionId: result.contributionId,
          amount: data.amount,
          pixEmv: result.pix.emv,
          bankSlipUrl: result.bankSlip?.url,
          startedAt: Date.now(),
        })
      }
    } catch {
      // error toast handled by hook
    }
  }

  // Submit without payment (pay later)
  async function submitPayLater(data: CampaignContributionFormData, forceCreate = false) {
    if (!campaign) return
    try {
      const result = await contributeAsync({
        houseSlug,
        campaignSlug,
        donorName: data.donorName,
        donorPhone: data.donorPhone,
        amount: data.amount,
        message: data.message || undefined,
        forceCreate,
      })

      if (result.duplicate) {
        setDuplicateInfo({
          donorName: result.existingDonorName || data.donorName,
          amount: result.existingAmount || data.amount,
          formData: data,
        })
        return
      }

      reset()
      refetch()
    } catch {
      // error toast handled by hook
    }
  }

  // Form submit -> open payment choice dialog
  function onSubmit(data: CampaignContributionFormData) {
    setPendingFormData(data)
    setPendingForceCreate(false)
    setPaymentChoiceOpen(true)
  }

  // Handle payment choice
  function handlePaymentChoice(choice: 'pix' | 'later') {
    if (!pendingFormData) return
    if (choice === 'pix' && pendingFormData.amount < 5) {
      toast.error('Valor minimo para pagamento via PIX e R$ 5,00')
      return
    }
    setPaymentChoiceOpen(false)
    setLastPaymentChoice(choice)
    const forceCreate = pendingForceCreate
    if (choice === 'pix') {
      submitWithPix(pendingFormData, forceCreate)
    } else {
      submitPayLater(pendingFormData, forceCreate)
    }
    setPendingFormData(null)
    setPendingForceCreate(false)
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <LoadingState message="Carregando lista..." />
      </PublicLayout>
    )
  }

  if (isError || !campaign) {
    return (
      <PublicLayout>
        <ErrorState
          title="Lista nao encontrada"
          message="Nao foi possivel carregar os dados da lista."
          onRetry={refetch}
        />
      </PublicLayout>
    )
  }

  const progressPercent =
    campaign.goalAmount > 0
      ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)
      : 0

  const isClosed = campaign.status === 'completed' || campaign.status === 'cancelled'

  return (
    <PublicLayout>
      {/* House Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/80">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <Avatar size="lg" className="border-2 border-white/30">
            {campaign.house.photoUrl && (
              <AvatarImage src={campaign.house.photoUrl} alt={campaign.house.name} />
            )}
            <AvatarFallback className="bg-white/20 text-white">
              <Home className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-primary-foreground sm:text-lg">
              {campaign.house.name}
            </p>
            <p className="text-xs text-primary-foreground/70">
              Organizador da lista
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Cover Image */}
        {campaign.imageUrl && (
          <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-xl">
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Completed / Cancelled Banner */}
        {campaign.status === 'completed' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/30">
            <CheckCircle2 className="size-5 shrink-0 text-green-600 dark:text-green-400" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-green-900 dark:text-green-100">
                Lista concluida!
              </p>
              <p className="text-green-800 dark:text-green-200">
                Esta lista foi encerrada. Obrigado a todos que contribuiram!
              </p>
            </div>
          </div>
        )}
        {campaign.status === 'cancelled' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <Info className="size-5 shrink-0 text-destructive" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-destructive">
                Lista cancelada
              </p>
              <p className="text-muted-foreground">
                Esta lista foi cancelada e nao aceita novas contribuicoes.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Campaign Info */}
          <div className="space-y-6 lg:col-span-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {campaign.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Progress Section */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Arrecadado</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(campaign.currentAmount)}
                  </span>
                </div>

                <Progress value={progressPercent} max={100} />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="size-3.5" />
                    <span>Meta: {formatCurrency(campaign.goalAmount)}</span>
                  </div>
                  <span className="font-medium tabular-nums">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PIX Payment Screen OR Contribution Form */}
          <div className="lg:col-span-2">
            {pixData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="size-4 text-primary" />
                    Pagar com PIX
                  </CardTitle>
                  <CardDescription>
                    Copie o codigo e pague no app do seu banco
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/50 p-4 text-center">
                    <p className="mb-1 text-2xl font-bold text-primary">
                      {formatCurrency(pixData.amount)}
                    </p>
                  </div>

                  {/* PIX Code */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Codigo PIX (Copia e Cola)</p>
                    <div className="relative">
                      <div className="max-h-20 overflow-y-auto rounded-md border bg-muted/30 p-3 text-xs break-all font-mono">
                        {pixData.pixEmv}
                      </div>
                    </div>
                    <Button
                      onClick={copyPixCode}
                      variant={copied ? 'default' : 'outline'}
                      className="w-full"
                      size="lg"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="size-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          Copiar codigo PIX
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Countdown */}
                  <PixCountdown
                    startedAt={pixData.startedAt}
                    onExpired={() => {
                      setPixData(null)
                      reset()
                      toast.info('PIX expirado. Sua contribuicao foi registrada para pagamento posterior.')
                    }}
                  />

                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      setPixData(null)
                      reset()
                    }}
                  >
                    Voltar ao formulario
                  </Button>
                </CardContent>
              </Card>
            ) : isClosed ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  {campaign.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold">Lista encerrada</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Esta lista foi concluida e nao aceita novas contribuicoes.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Info className="size-8 text-destructive" />
                      <div>
                        <p className="font-semibold">Lista cancelada</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Esta lista foi cancelada e nao aceita novas contribuicoes.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="size-4 text-primary" />
                    Contribuir
                  </CardTitle>
                  <CardDescription>
                    Faca sua contribuicao para esta lista
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      label="Valor (R$)"
                      name="amount"
                      error={errors.amount}
                    >
                      <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                          <CurrencyInput
                            id="amount"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                    </FormField>

                    <FormField
                      label="Seu nome"
                      name="donorName"
                      error={errors.donorName}
                    >
                      <Input
                        id="donorName"
                        placeholder="Nome completo"
                        {...register('donorName')}
                      />
                    </FormField>

                    <FormField
                      label="CPF"
                      name="donorDocument"
                      error={errors.donorDocument}
                    >
                      <MaskedInput
                        id="donorDocument"
                        mask="cpf"
                        placeholder="000.000.000-00"
                        {...register('donorDocument')}
                      />
                    </FormField>

                    <FormField
                      label="Telefone (WhatsApp)"
                      name="donorPhone"
                      error={errors.donorPhone}
                    >
                      <MaskedInput
                        id="donorPhone"
                        mask="phone"
                        placeholder="(00) 00000-0000"
                        {...register('donorPhone')}
                      />
                    </FormField>

                    <FormField
                      label="Email (opcional)"
                      name="donorEmail"
                      error={errors.donorEmail}
                    >
                      <Input
                        id="donorEmail"
                        type="email"
                        placeholder="seu@email.com"
                        {...register('donorEmail')}
                      />
                    </FormField>

                    <FormField
                      label="Mensagem (opcional)"
                      name="message"
                      error={errors.message}
                      description="Maximo 200 caracteres"
                    >
                      <Textarea
                        id="message"
                        rows={3}
                        maxLength={200}
                        placeholder="Deixe uma mensagem de apoio..."
                        {...register('message')}
                      />
                    </FormField>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isPending}
                      className="w-full"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Heart className="size-4" />
                          Contribuir
                        </>
                      )}
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
          {/* Header with amount */}
          <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pb-5 pt-6 text-primary-foreground">
            <p className="text-sm font-medium text-primary-foreground/70">Sua contribuicao</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {pendingFormData ? formatCurrency(pendingFormData.amount) : ''}
            </p>
            {pendingFormData?.donorName && (
              <p className="mt-1 text-sm text-primary-foreground/80">
                {pendingFormData.donorName}
              </p>
            )}
          </div>

          <div className="px-6 pb-6 pt-4">
            <p className="mb-4 text-sm font-medium text-foreground">
              Como deseja pagar?
            </p>
            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/10 disabled:opacity-50"
                onClick={() => handlePaymentChoice('pix')}
                disabled={isPending}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <QrCode className="size-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Pagar agora com PIX</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Gere o codigo PIX e pague na hora pelo app do banco
                  </p>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-4 rounded-xl border-2 border-muted p-4 text-left transition-all hover:border-muted-foreground/30 hover:bg-muted/50 disabled:opacity-50"
                onClick={() => handlePaymentChoice('later')}
                disabled={isPending}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <HandCoins className="size-6 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Pagar depois</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Registre sua contribuicao e combine o pagamento
                  </p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirm Dialog */}
      <DuplicateConfirmDialog
        open={!!duplicateInfo}
        onClose={() => setDuplicateInfo(null)}
        onConfirm={() => {
          if (duplicateInfo) {
            const formData = duplicateInfo.formData
            setDuplicateInfo(null)
            // Retry with forceCreate using the same payment method chosen before
            if (lastPaymentChoice === 'pix') {
              submitWithPix(formData, true)
            } else if (lastPaymentChoice === 'later') {
              submitPayLater(formData, true)
            } else {
              // Fallback: re-open choice dialog
              setPendingFormData({ ...formData })
              setPendingForceCreate(true)
              setPaymentChoiceOpen(true)
            }
          }
        }}
        isPending={isPending}
        donorName={duplicateInfo?.donorName}
        amount={duplicateInfo?.amount}
      />
    </PublicLayout>
  )
}
