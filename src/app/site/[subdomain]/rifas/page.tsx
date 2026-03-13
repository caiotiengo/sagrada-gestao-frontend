'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Ticket, Calendar } from 'lucide-react'

import { useSiteContext } from '@/components/site/site-provider'
import { usePublicRaffles } from '@/hooks/use-public'
import { formatCurrency, formatDate } from '@/utils'
import { SiteInnerLayout } from '@/components/site/site-inner-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  selling: { label: 'Em venda', variant: 'default' },
  drawn: { label: 'Sorteada', variant: 'secondary' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

export default function SiteRafflesPage() {
  const { house } = useSiteContext()
  const { data: raffles, isLoading, isError, refetch } = usePublicRaffles(house.slug)

  if (isLoading) {
    return (
      <SiteInnerLayout title="Rifas">
        <LoadingState message="Carregando rifas..." />
      </SiteInnerLayout>
    )
  }

  if (isError) {
    return (
      <SiteInnerLayout title="Rifas">
        <ErrorState title="Erro ao carregar" message="Não foi possível carregar as rifas." onRetry={refetch} />
      </SiteInnerLayout>
    )
  }

  if (!raffles || raffles.length === 0) {
    return (
      <SiteInnerLayout title="Rifas">
        <EmptyState
          icon={Ticket}
          title="Nenhuma rifa disponível"
          description="Não há rifas públicas no momento."
          className="min-h-[50dvh]"
        />
      </SiteInnerLayout>
    )
  }

  return (
    <SiteInnerLayout title="Rifas">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {raffles.map((raffle) => {
            const status = STATUS_LABELS[raffle.status] || { label: raffle.status, variant: 'outline' as const }
            const soldPercent = raffle.totalNumbers > 0 ? (raffle.soldNumbers / raffle.totalNumbers) * 100 : 0

            return (
              <Link key={raffle.id} href={`/rifas/${raffle.slug}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  {raffle.imageUrl && (
                    <div className="relative aspect-[16/9] w-full">
                      <Image src={raffle.imageUrl} alt={raffle.title} fill className="object-cover" />
                    </div>
                  )}
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{raffle.title}</h3>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>

                    {raffle.description && (
                      <p className="line-clamp-2 text-sm text-gray-500">{raffle.description}</p>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{raffle.soldNumbers} / {raffle.totalNumbers} vendidos</span>
                        <span>{soldPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={soldPercent} max={100} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[var(--site-primary)]">
                        {formatCurrency(raffle.numberPrice)} / número
                      </span>
                      {raffle.drawDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="size-3" />
                          {formatDate(raffle.drawDate)}
                        </span>
                      )}
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
