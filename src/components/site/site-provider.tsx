'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
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

  // Set dynamic title and favicon for public site
  useEffect(() => {
    if (!house) return
    const title = house.siteConfig?.siteTitle || house.displayName || house.name
    document.title = title

    const faviconUrl = house.siteConfig?.faviconUrl
    if (faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [house])

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
