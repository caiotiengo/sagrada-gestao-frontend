'use client'

import { useRedirectIfAuthenticated } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { LoadingState } from '@/components/feedback/loading-state'

export default function HomePage() {
  // Logado -> home da área (admin/membro); sem sessão -> /login
  useRedirectIfAuthenticated(ROUTES.LOGIN)
  return <LoadingState message="Carregando..." />
}
