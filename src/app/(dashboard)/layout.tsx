'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { readCachedBilling, useAuthStore } from '@/stores/auth'
import { useProfile } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import type { HouseMembership } from '@/types'
import type { HouseBilling } from '@/services/billing'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { HouseSuspended } from '@/components/billing/house-suspended'
import { useHouseBilling } from '@/hooks/use-billing'

// Map permissions to the admin routes they unlock for members
const permissionRouteMap: Record<string, string[]> = {
  canManageCashier: ['/admin/financeiro', '/admin/comprovantes'],
  canManageMembers: ['/admin/membros', '/admin/avisos'],
  canManageCalendar: ['/admin/calendario'],
  canManageCampaigns: ['/admin/listas'],
  canManageRaffles: ['/admin/rifas'],
  canRegisterSales: ['/admin/loja', '/admin/cantina'],
}

/**
 * Casa bloqueada por pagamento pendente: a liderança só fica em Plano e
 * cobrança e no perfil (sair/excluir conta); o resto vai para Plano e cobrança.
 */
const BLOCKED_LEADER_PATHS = [ROUTES.ADMIN_BILLING, ROUTES.PROFILE]
const BLOCKED_MEMBER_PATHS = [ROUTES.PROFILE]
const allowedWhenBlocked = (pathname: string, paths: string[]) => paths.some((p) => pathname === p || pathname.startsWith(p + '/'))

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
  // A Liderança também deve (mensalidade, fiado, rifa): o financeiro pessoal fica aberto para ela.
  if (house.role === 'admin' && isMemberRoute && !pathname.startsWith(ROUTES.MEMBER_FINANCE)) {
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
  const { isAuthenticated, isLoading, hydrate, currentHouse, profile } = useAuthStore()

  // Perfil sempre buscado do back ao abrir o app: papel e permissões vêm de lá,
  // não do que ficou salvo no navegador (permissão nova vale sem relogar).
  // Redirecionar só com o perfil atualizado; mas, se o perfil salvo já permite
  // a rota, a página monta em paralelo (não espera a callable para começar).
  const profileQuery = useProfile()
  const profileSettled = profileQuery.isFetched || profileQuery.isError
  const hasStoredProfile = !!profile

  useEffect(() => {
    const unsubscribe = hydrate()
    return () => unsubscribe()
  }, [hydrate])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN)
    }
  }, [isLoading, isAuthenticated, router])

  // Estado da cobrança da casa (callable isenta do bloqueio). Qualquer
  // callable que responder house_blocked dispara 'sg:house-blocked' (lib/callable)
  // e este refetch troca a tela na hora.
  const billing = useHouseBilling()
  const refetchBilling = billing.refetch
  useEffect(() => {
    const onBlocked = () => { void refetchBilling() }
    window.addEventListener('sg:house-blocked', onBlocked)
    return () => window.removeEventListener('sg:house-blocked', onBlocked)
  }, [refetchBilling])
  // Enquanto o getHouseBilling não volta, vale o último estado salvo da casa
  // (só para mostrar a tela; redirecionar, só com o valor do servidor). Se a
  // casa tiver sido bloqueada nesse meio-tempo, a primeira callable recusada
  // dispara 'sg:house-blocked' e o refetch acima troca a tela.
  const cachedBilling = billing.data ? null : readCachedBilling<HouseBilling>(currentHouse?.houseId ?? null)
  const billingData = billing.data ?? cachedBilling
  const blocked = billingData?.access === 'blocked'
  const isLeader = !!billingData?.canManage
  // Resposta do servidor (ou erro) já chegou: só então redireciona por cobrança.
  // errorUpdateCount (e não isError): depois de um erro, cada observer novo
  // refaz a busca e a query volta a 'pending'; se o layout voltasse para o
  // carregando, desmontaria a página e remontaria em laço (getHouseBilling em
  // loop enquanto a callable falhar).
  const billingFailed = billing.errorUpdateCount > 0
  const billingSettled = !currentHouse || !!billing.data || billingFailed

  const target = currentHouse
    ? blocked && isLeader && !allowedWhenBlocked(pathname, BLOCKED_LEADER_PATHS)
      ? ROUTES.ADMIN_BILLING
      : blocked
        ? null
        : redirectFor(pathname, currentHouse)
    : null

  // Redirect users to their correct area based on role — só depois do perfil
  // atualizado, para não decidir com permissões antigas.
  useEffect(() => {
    if (!isLoading && isAuthenticated && profileSettled && target && billingSettled) {
      router.replace(target)
    }
  }, [isLoading, isAuthenticated, profileSettled, target, billingSettled, router])

  if (isLoading) {
    return <LoadingState message="Carregando..." />
  }

  if (!isAuthenticated) {
    return <LoadingState message="Redirecionando..." />
  }

  // Não monta a página (nem dispara callables) antes de saber se o usuário
  // pode estar nela: com o perfil atualizado ou, enquanto ele não chega, com o
  // perfil salvo, desde que ele não mande para outra rota.
  if (!profileSettled && !(hasStoredProfile && !target)) {
    return <LoadingState message="Carregando..." />
  }

  // Sem saber se a casa está bloqueada (nem pelo último estado salvo), não monta
  // a página (as callables dela seriam recusadas).
  if (currentHouse && billing.isLoading && !cachedBilling && !billingFailed) {
    return <LoadingState message="Carregando..." />
  }

  if (target && !billingSettled) {
    return <LoadingState message="Carregando..." />
  }

  if (target) {
    return <LoadingState message="Redirecionando..." />
  }

  if (blocked && !isLeader && !allowedWhenBlocked(pathname, BLOCKED_MEMBER_PATHS)) {
    return <HouseSuspended />
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
