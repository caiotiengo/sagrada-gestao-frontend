'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    const unsubscribe = hydrate()
    return () => unsubscribe()
  }, [hydrate])

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
