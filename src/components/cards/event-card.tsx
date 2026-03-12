'use client'

import { CalendarDays, MapPin } from 'lucide-react'

import { formatDate } from '@/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EventCardProps {
  title: string
  date: string
  location?: string
  description?: string
}

export function EventCard({ title, date, location, description }: EventCardProps) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <CalendarDays className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{title}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(date)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        {location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
