'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { useHouseBySubdomain } from '@/hooks/use-site'
import { usePublicEvents } from '@/hooks/use-public'
import type { PublicHouse, PublicEventItem } from '@/types'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'

interface SiteContextValue {
  house: PublicHouse
  subdomain: string
  events: PublicEventItem[]
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function useSiteContext() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSiteContext must be used within SiteProvider')
  return ctx
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const subdomain = params.subdomain as string
  const { data: house, isLoading, isError } = useHouseBySubdomain(subdomain)
  const { data: events } = usePublicEvents(house?.slug ?? '')

  if (isLoading) return <LoadingState message="Carregando site..." />
  if (isError || !house)
    return (
      <ErrorState
        title="Site não encontrado"
        message="Este site não existe ou está desativado."
      />
    )

  return (
    <SiteContext.Provider value={{ house, subdomain, events: events ?? [] }}>
      {children}
    </SiteContext.Provider>
  )
}
