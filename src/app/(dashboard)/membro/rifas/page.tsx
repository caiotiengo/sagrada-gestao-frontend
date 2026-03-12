'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ticket, Trophy, Calendar, Share2, Check } from 'lucide-react'
import { useRaffles } from '@/hooks/use-raffles'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDate } from '@/utils'
import type { RaffleItem, RaffleStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LoadingState } from '@/components/feedback/loading-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'

const STATUS_LABELS: Record<RaffleStatus, string> = {
  draft: 'Rascunho',
  selling: 'Vendendo',
  drawn: 'Sorteada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<RaffleStatus, string> = {
  selling: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  drawn: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

export default function MemberRafflesPage() {
  const { data, isLoading, isError, refetch } = useRaffles(1)

  const raffles = data?.data ?? []

  if (isLoading) {
    return <LoadingState />
  }

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
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Rifas</h1>
      </div>

      {raffles.length > 0 ? (
        <div className="space-y-4">
          {raffles.map((raffle) => (
            <Link key={raffle.id} href={ROUTES.MEMBER_RAFFLE_DETAIL(raffle.id)}>
              <RaffleCard raffle={raffle} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="Nenhuma rifa disponível"
          description="Não há rifas disponíveis no momento."
          className="min-h-[30dvh]"
        />
      )}
    </div>
  )
}

function RaffleShareButton({ raffle }: { raffle: RaffleItem }) {
  const { currentHouse } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const houseSlug = currentHouse?.houseSlug

  if (!houseSlug || !raffle.isPublic) return null

  const url = `${window.location.origin}${ROUTES.PUBLIC_RAFFLE(houseSlug, raffle.slug)}`

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: raffle.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleShare} aria-label="Compartilhar">
      {copied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
    </Button>
  )
}

function RaffleCard({ raffle }: { raffle: RaffleItem }) {
  const progress =
    raffle.totalNumbers > 0
      ? Math.round((raffle.soldNumbers / raffle.totalNumbers) * 100)
      : 0

  return (
    <Card className="rounded-xl">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{raffle.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {raffle.prizeDescription}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <RaffleShareButton raffle={raffle} />
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[raffle.status]}`}
            >
              {STATUS_LABELS[raffle.status]}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {raffle.soldNumbers} / {raffle.totalNumbers} números vendidos
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Ticket className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Preço:</span>
            <span className="font-medium">
              {formatCurrency(raffle.numberPrice)}
            </span>
          </div>

          {raffle.drawDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Sorteio:</span>
              <span className="font-medium">{formatDate(raffle.drawDate)}</span>
            </div>
          )}
        </div>

        {raffle.status === 'drawn' && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
            <Trophy className="size-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Rifa sorteada
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
