'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { logEvent } from 'firebase/analytics'
import { getAnalyticsInstance } from '@/lib/firebase'
import '@/lib/analytics' // initializes global error listeners

// useSearchParams fica isolado num irmão com Suspense próprio: assim ele não
// tira as páginas estáticas (ex.: a landing em /) da renderização no servidor.
function PageViewTracker() {
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

  return null
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  )
}
