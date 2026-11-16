'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { useProfile } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import type { HouseMembership } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoadingState } from '@/components/feedback/loading-state'

// Map permissions to the admin routes they unlock for members
const permissionRouteMap: Record<string, string[]> = {
  canManageCashier: ['/admin/financeiro'],
  canManageMembers: ['/admin/membros', '/admin/avisos'],
  canManageCalendar: ['/admin/calendario'],
  canManageCampaigns: ['/admin/listas'],
  canManageRaffles: ['/admin/rifas'],
  canRegisterSales: ['/admin/loja', '/admin/cantina'],
}

/** Rota para onde o usuário deve ir, ou null se pode ficar na atual. */
function redirectFor(pathname: string, house: HouseMembership): string | null {
  const isAdminRoute = pathname.startsWith('/admin')
  const isMemberRoute = pathname.startsWith('/membro')

  if (house.role === 'filho_de_santo' && isAdminRoute) {
    const perms = house.extraPermissions ?? []
    const allowedRoutes = perms.flatMap((p) => permissionRouteMap[p] ?? [])
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route))
    return hasAccess ? null : ROUTES.MEMBER_HOME
  }
  if (house.role === 'admin' && isMemberRoute) {
    return ROUTES.ADMIN_HOME
  }
  return null
}

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, hydrate, currentHouse } = useAuthStore()

  // Perfil sempre buscado do back ao abrir o app: papel e permissões vêm de lá,
  // não do que ficou salvo no navegador (permissão nova vale sem relogar).
  const profileQuery = useProfile()
  const profileSettled = profileQuery.isFetched || profileQuery.isError

  useEffect(() => {
    const unsubscribe = hydrate()
    return () => unsubscribe()
  }, [hydrate])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, router])

  const target = currentHouse ? redirectFor(pathname, currentHouse) : null

  // Redirect users to their correct area based on role — só depois do perfil
  // atualizado, para não decidir com permissões antigas.
  useEffect(() => {
    if (!isLoading && isAuthenticated && profileSettled && target) {
      router.replace(target)
    }
  }, [isLoading, isAuthenticated, profileSettled, target, router])

  if (isLoading) {
    return <LoadingState message="Carregando..." />
  }

  if (!isAuthenticated) {
    return <LoadingState message="Redirecionando..." />
  }

  // Não monta a página (nem dispara callables) antes de saber se o usuário
  // pode estar nela.
  if (!profileSettled) {
    return <LoadingState message="Carregando..." />
  }

  if (target) {
    return <LoadingState message="Redirecionando..." />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
