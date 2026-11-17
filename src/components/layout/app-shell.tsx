'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const isLoading = useAuthStore((state) => state.isLoading)
  const pathname = usePathname()
  // A landing (/) é pública e renderiza no servidor (SEO); ela mesma cuida de
  // mandar quem já está logado para a área certa, sem esperar o hydrate.
  const isLanding = pathname === ROUTES.HOME

  useEffect(() => {
    const unsubscribe = hydrate()
    return () => unsubscribe()
  }, [hydrate])

  if (isLoading && !isLanding) {
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
