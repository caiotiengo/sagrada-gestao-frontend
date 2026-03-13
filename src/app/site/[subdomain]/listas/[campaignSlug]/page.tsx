'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Heart, Info, Loader2, Target, CheckCircle2 } from 'lucide-react'

import { campaignContributionSchema, type CampaignContributionFormData } from '@/schemas/campaign'
import { useSiteContext } from '@/components/site/site-provider'
import { usePublicCampaign, useCampaignContribute } from '@/hooks/use-public'
import { formatCurrency } from '@/utils'
import { SiteInnerLayout } from '@/components/site/site-inner-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { FormField } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/forms/currency-input'
import { MaskedInput } from '@/components/forms/masked-input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

export default function SiteCampaignPage() {
  const { house } = useSiteContext()
  const params = useParams()
  const campaignSlug = params.campaignSlug as string

  const { data: campaign, isLoading, isError, refetch } = usePublicCampaign(house.slug, campaignSlug)
  const { mutate: contribute, isPending } = useCampaignContribute()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CampaignContributionFormData>({
    resolver: zodResolver(campaignContributionSchema),
    defaultValues: { amount: 0, donorName: '', donorPhone: '', donorEmail: '', message: '' },
  })

  function onSubmit(data: CampaignContributionFormData) {
    if (!campaign) return
    contribute(
      {
        houseSlug: house.slug,
        campaignSlug,
        donorName: data.donorName,
        donorPhone: data.donorPhone,
        amount: data.amount,
        message: data.message || undefined,
      },
      {
        onSuccess: () => {
          reset()
          refetch()
        },
      },
    )
  }

  if (isLoading) {
    return (
      <SiteInnerLayout title="Lista">
        <LoadingState message="Carregando lista..." />
      </SiteInnerLayout>
    )
  }

  if (isError || !campaign) {
    return (
      <SiteInnerLayout title="Lista">
        <ErrorState title="Lista não encontrada" message="Não foi possível carregar os dados da lista." onRetry={refetch} />
      </SiteInnerLayout>
    )
  }

  const progressPercent = campaign.goalAmount > 0
    ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)
    : 0
  const isClosed = campaign.status === 'completed' || campaign.status === 'cancelled'

  return (
    <SiteInnerLayout title="Lista">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {campaign.imageUrl && (
          <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-xl">
            <Image src={campaign.imageUrl} alt={campaign.title} fill className="object-cover" priority />
          </div>
        )}

        {campaign.status === 'completed' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="size-5 shrink-0 text-green-600" />
            <div className="text-sm">
              <p className="font-semibold text-green-900">Lista concluída!</p>
              <p className="text-green-800">Obrigado a todos que contribuíram!</p>
            </div>
          </div>
        )}
        {campaign.status === 'cancelled' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <Info className="size-5 shrink-0 text-red-500" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">Lista cancelada</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{campaign.title}</h1>
              <p className="text-gray-500 leading-relaxed">{campaign.description}</p>
            </div>

            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Arrecadado</span>
                  <span className="font-semibold text-[var(--site-primary)]">{formatCurrency(campaign.currentAmount)}</span>
                </div>
                <Progress value={progressPercent} max={100} />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Target className="size-3.5" />
                    <span>Meta: {formatCurrency(campaign.goalAmount)}</span>
                  </div>
                  <span className="font-medium tabular-nums">{progressPercent.toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {isClosed ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  {campaign.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="size-8 text-green-600" />
                      <div>
                        <p className="font-semibold">Lista encerrada</p>
                        <p className="mt-1 text-sm text-gray-500">Não aceita novas contribuições.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Info className="size-8 text-red-500" />
                      <div>
                        <p className="font-semibold">Lista cancelada</p>
                        <p className="mt-1 text-sm text-gray-500">Não aceita novas contribuições.</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="size-4 text-[var(--site-primary)]" />
                    Contribuir
                  </CardTitle>
                  <CardDescription>Faça sua contribuição para esta lista</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField label="Valor (R$)" name="amount" error={errors.amount}>
                      <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                          <CurrencyInput id="amount" value={field.value} onValueChange={field.onChange} />
                        )}
                      />
                    </FormField>

                    <FormField label="Seu nome" name="donorName" error={errors.donorName}>
                      <Input id="donorName" placeholder="Nome completo" {...register('donorName')} />
                    </FormField>

                    <FormField label="Telefone (WhatsApp)" name="donorPhone" error={errors.donorPhone}>
                      <MaskedInput id="donorPhone" mask="phone" placeholder="(00) 00000-0000" {...register('donorPhone')} />
                    </FormField>

                    <FormField label="Email (opcional)" name="donorEmail" error={errors.donorEmail}>
                      <Input id="donorEmail" type="email" placeholder="seu@email.com" {...register('donorEmail')} />
                    </FormField>

                    <FormField label="Mensagem (opcional)" name="message" error={errors.message} description="Máximo 200 caracteres">
                      <Textarea id="message" rows={3} maxLength={200} placeholder="Deixe uma mensagem de apoio..." {...register('message')} />
                    </FormField>

                    <Button type="submit" size="lg" disabled={isPending} className="w-full">
                      {isPending && <Loader2 className="size-4 animate-spin" />}
                      {isPending ? 'Enviando...' : 'Contribuir'}
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
