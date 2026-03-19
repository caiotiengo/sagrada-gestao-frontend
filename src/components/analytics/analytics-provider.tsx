'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { logEvent } from 'firebase/analytics'
import { getAnalyticsInstance } from '@/lib/firebase'
import '@/lib/analytics' // initializes global error listeners

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const analytics = getAnalyticsInstance()
    if (!analytics) return
    logEvent(analytics, 'page_view', {
      page_path: pathname,
      page_search: searchParams.toString(),
    })
  }, [pathname, searchParams])

  return <>{children}</>
}
