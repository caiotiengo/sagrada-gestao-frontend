'use client'

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import type { ValidateInviteResponse } from '@/types'
import { INVITE_TYPE_LABELS } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface InviteValidationCardProps {
  isLoading: boolean
  isError: boolean
  data?: ValidateInviteResponse
}

export function InviteValidationCard({
  isLoading,
  isError,
  data,
}: InviteValidationCardProps) {
  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-5 w-48" />
            <Skeleton className="mx-auto h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="rounded-xl border-red-200 shadow-sm dark:border-red-900">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Convite inválido</p>
            <p className="text-sm text-muted-foreground">
              Este convite expirou, foi revogado ou não existe.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const roleLabel = INVITE_TYPE_LABELS[data.inviteType] ?? data.inviteType

  return (
    <Card className="rounded-xl border-indigo-200 shadow-sm dark:border-indigo-900">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <CheckCircle2 className="size-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold">{data.houseName}</p>
          <Badge variant="secondary">{roleLabel}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Você foi convidado para se juntar a esta casa.
        </p>
      </CardContent>
    </Card>
  )
}
