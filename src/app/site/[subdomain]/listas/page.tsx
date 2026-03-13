'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Target } from 'lucide-react'

import { useSiteContext } from '@/components/site/site-provider'
import { usePublicCampaigns } from '@/hooks/use-public'
import { formatCurrency } from '@/utils'
import { SiteInnerLayout } from '@/components/site/site-inner-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { label: 'Ativa', variant: 'default' },
  completed: { label: 'Concluída', variant: 'secondary' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

export default function SiteCampaignsPage() {
  const { house } = useSiteContext()
  const { data: campaigns, isLoading, isError, refetch } = usePublicCampaigns(house.slug)

  if (isLoading) {
    return (
      <SiteInnerLayout title="Listas">
        <LoadingState message="Carregando listas..." />
      </SiteInnerLayout>
    )
  }

  if (isError) {
    return (
      <SiteInnerLayout title="Listas">
        <ErrorState title="Erro ao carregar" message="Não foi possível carregar as listas." onRetry={refetch} />
      </SiteInnerLayout>
    )
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <SiteInnerLayout title="Listas">
        <EmptyState
          icon={Heart}
          title="Nenhuma lista disponível"
          description="Não há listas públicas no momento."
          className="min-h-[50dvh]"
        />
      </SiteInnerLayout>
    )
  }

  return (
    <SiteInnerLayout title="Listas">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => {
            const status = STATUS_LABELS[campaign.status] || { label: campaign.status, variant: 'outline' as const }
            const progressPercent = campaign.goalAmount > 0
              ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)
              : 0

            return (
              <Link key={campaign.id} href={`/listas/${campaign.slug}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  {campaign.imageUrl && (
                    <div className="relative aspect-[16/9] w-full">
                      <Image src={campaign.imageUrl} alt={campaign.title} fill className="object-cover" />
                    </div>
                  )}
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{campaign.title}</h3>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>

                    {campaign.description && (
                      <p className="line-clamp-2 text-sm text-gray-500">{campaign.description}</p>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Target className="size-3" />
                          Meta: {formatCurrency(campaign.goalAmount)}
                        </span>
                        <span>{progressPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPercent} max={100} />
                      <p className="text-sm font-semibold text-[var(--site-primary)]">
                        {formatCurrency(campaign.currentAmount)} arrecadados
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </SiteInnerLayout>
  )
}
