'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { useProfile } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoadingState } from '@/components/feedback/loading-state'

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, hydrate, currentHouse } = useAuthStore()

  // Refresh profile from backend to get latest data (houseSlug, etc.)
  useProfile()

  useEffect(() => {
    const unsubscribe = hydrate()
    return () => unsubscribe()
  }, [hydrate])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, router])

  // Map permissions to the admin routes they unlock for members
  const permissionRouteMap: Record<string, string[]> = {
    canManageCashier: ['/admin/financeiro'],
    canManageMembers: ['/admin/membros'],
    canManageCalendar: ['/admin/calendario'],
    canManageCampaigns: ['/admin/listas'],
    canManageRaffles: ['/admin/rifas'],
    canRegisterSales: ['/admin/loja', '/admin/cantina'],
  }

  // Redirect users to their correct area based on role
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentHouse) {
      const isAdminRoute = pathname.startsWith('/admin')
      const isMemberRoute = pathname.startsWith('/membro')

      if (currentHouse.role === 'filho_de_santo' && isAdminRoute) {
        // Check if member has permission for this specific admin route
        const perms = currentHouse.extraPermissions ?? []
        const allowedRoutes = perms.flatMap((p) => permissionRouteMap[p] ?? [])
        const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route))
        if (!hasAccess) {
          router.replace(ROUTES.MEMBER_HOME)
        }
      } else if (currentHouse.role === 'admin' && isMemberRoute) {
        router.replace(ROUTES.ADMIN_HOME)
      }
    }
  }, [isLoading, isAuthenticated, currentHouse, pathname, router])

  if (isLoading) {
    return <LoadingState message="Carregando..." />
  }

  if (!isAuthenticated) {
    return <LoadingState message="Redirecionando..." />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
