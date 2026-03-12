'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Ticket } from 'lucide-react'

import { formatCurrency, formatDate } from '@/utils'
import { ROUTES } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RaffleCardProps {
  title: string
  pricePerNumber: number
  totalNumbers: number
  soldNumbers: number
  drawDate: string
  coverUrl?: string
  slug: string
  houseSlug: string
}

export function RaffleCard({
  title,
  pricePerNumber,
  totalNumbers,
  soldNumbers,
  drawDate,
  coverUrl,
  slug,
  houseSlug,
}: RaffleCardProps) {
  const availableNumbers = totalNumbers - soldNumbers
  const soldPercentage = totalNumbers > 0 ? Math.round((soldNumbers / totalNumbers) * 100) : 0
  const isSoldOut = availableNumbers <= 0

  return (
    <Link href={ROUTES.PUBLIC_RAFFLE(houseSlug, slug)}>
      <Card className="group rounded-xl shadow-sm transition-shadow hover:shadow-md">
        {coverUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2">
              <Ticket className="mt-0.5 size-4 shrink-0 text-violet-500" />
              <CardTitle className="line-clamp-1">{title}</CardTitle>
            </div>
            {isSoldOut ? (
              <Badge variant="secondary">Esgotado</Badge>
            ) : (
              <Badge variant="outline">{availableNumbers} restantes</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor por número</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(pricePerNumber)}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{soldNumbers}/{totalNumbers} vendidos</span>
            <span>Sorteio: {formatDate(drawDate)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
