'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Heart, Home, Info, Loader2, Target, CheckCircle2 } from 'lucide-react'

import {
  campaignContributionSchema,
  type CampaignContributionFormData,
} from '@/schemas/campaign'
import {
  usePublicCampaign,
  useCampaignContribute,
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

interface PageProps {
  params: Promise<{
    houseSlug: string
    campaignSlug: string
  }>
}

export default function PublicCampaignPage({ params }: PageProps) {
  const { houseSlug, campaignSlug } = use(params)

  const {
    data: campaign,
    isLoading,
    isError,
    refetch,
  } = usePublicCampaign(houseSlug, campaignSlug)

  const { mutateAsync: contributeAsync, isPending } = useCampaignContribute()

  const [duplicateInfo, setDuplicateInfo] = useState<{ donorName: string; amount: number; formData: CampaignContributionFormData } | null>(null)
  const [contributionSuccess, setContributionSuccess] = useState(false)

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

  async function submitContribution(data: CampaignContributionFormData, forceCreate = false) {
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
      setContributionSuccess(true)
      refetch()
    } catch {
      // error toast handled by hook
    }
  }

  function onSubmit(data: CampaignContributionFormData) {
    submitContribution(data)
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
          <div className="space-y-6 lg:col-span-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {campaign.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {campaign.description}
              </p>
            </div>

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

          <div className="lg:col-span-2">
            {contributionSuccess ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  <Heart className="size-10 text-emerald-500" />
                  <div>
                    <p className="text-base font-semibold">Contribuição registrada!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aguardando confirmação do administrador.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setContributionSuccess(false)}>
                    Fazer outra contribuição
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
                    Registre sua contribuicao. O administrador confirmará o pagamento.
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
                      label="CPF (opcional)"
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

      <DuplicateConfirmDialog
        open={!!duplicateInfo}
        onClose={() => setDuplicateInfo(null)}
        onConfirm={() => {
          if (duplicateInfo) {
            const formData = duplicateInfo.formData
            setDuplicateInfo(null)
            submitContribution(formData, true)
          }
        }}
        isPending={isPending}
        donorName={duplicateInfo?.donorName}
        amount={duplicateInfo?.amount}
      />
    </PublicLayout>
  )
}
