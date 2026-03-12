'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'

import { formatCurrency } from '@/utils'
import { ROUTES } from '@/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'

interface CampaignCardProps {
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  coverUrl?: string
  slug: string
  houseSlug: string
}

export function CampaignCard({
  title,
  description,
  goalAmount,
  currentAmount,
  coverUrl,
  slug,
  houseSlug,
}: CampaignCardProps) {
  const percentage = goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0

  return (
    <Link href={ROUTES.PUBLIC_CAMPAIGN(houseSlug, slug)}>
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
          <div className="flex items-start gap-2">
            <Heart className="mt-0.5 size-4 shrink-0 text-indigo-500" />
            <CardTitle className="line-clamp-1">{title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

          <div className="space-y-2">
            <Progress value={percentage}>
              <ProgressLabel className="text-xs">
                {formatCurrency(currentAmount)}
              </ProgressLabel>
              <ProgressValue className="text-xs" />
            </Progress>

            <p className="text-xs text-muted-foreground">
              Meta: {formatCurrency(goalAmount)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
