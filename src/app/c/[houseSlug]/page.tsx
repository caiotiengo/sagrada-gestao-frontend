'use client'

import { useParams } from 'next/navigation'
import { MapPin, Phone, Calendar } from 'lucide-react'

import { usePublicHouse } from '@/hooks/use-public'
import { PublicLayout } from '@/components/layout/public-layout'
import { PublicHouseHeader } from '@/components/layout/public-house-header'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PublicHousePage() {
  const params = useParams<{ houseSlug: string }>()
  const { data: house, isLoading, isError, refetch } = usePublicHouse(params.houseSlug)

  if (isLoading) {
    return (
      <PublicLayout>
        <LoadingState message="Carregando informações da casa..." />
      </PublicLayout>
    )
  }

  if (isError || !house) {
    return (
      <PublicLayout>
        <ErrorState
          title="Casa não encontrada"
          message="Não foi possível carregar as informações desta casa. Verifique o endereço e tente novamente."
          onRetry={refetch}
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout houseName={house.displayName}>
      <PublicHouseHeader house={house} />

      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
        {/* Descrição */}
        {house.description && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="py-5">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Sobre a casa
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {house.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Endereço */}
        {house.address && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex items-start gap-3 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Endereço
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {house.address}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dias de Sessão */}
        {house.daysOfGira && house.daysOfGira.length > 0 && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="size-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Dias de Sessão
                </h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {house.daysOfGira.map((day: string) => (
                  <Badge key={day} variant="secondary">
                    {day}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Telefones de Contato */}
        {house.contactNumbers && house.contactNumbers.length > 0 && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="size-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Telefones de Contato
                </h2>
              </div>
              <div className="mt-3 space-y-2">
                {house.contactNumbers.map((phone: string, index: number) => (
                  <a
                    key={index}
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicLayout>
  )
}
