'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getStoredHomeRoute, useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'
import { disableWebPush } from '@/lib/web-push'
import type { RegisterHouseRequest } from '@/types'
import { ROUTES } from '@/constants'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'

export function useLogin() {
  const { setProfile } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.login(data.email, data.password),
    onSuccess: (response) => {
      // Perfil recém-buscado: o layout não precisa pedir de novo
      queryClient.setQueryData(['profile'], response)
      setProfile(response)

      // Route based on the selected house (first one).
      // Prefer admin house if one exists, otherwise member home.
      const adminHouse = response.houses.find((h) => h.role === 'admin')
      if (adminHouse) {
        setProfile(response, adminHouse.houseId)
        router.push(ROUTES.ADMIN_HOME)
      } else {
        router.push(ROUTES.MEMBER_HOME)
      }
      toast.success('Login realizado com sucesso!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Email ou senha inválidos'))
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authService.requestPasswordReset(data),
    onSuccess: () => {
      toast.success('Se o email existir, um link de recuperação será enviado.')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao enviar email de recuperação'))
    },
  })
}

export function useRegisterAdmin() {
  const { setProfile } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: RegisterHouseRequest & { email: string; password: string }) => {
      const result = await authService.registerHouse(data)
      // After registration, fetch full profile
      const profile = await authService.getProfile()
      return { result, profile }
    },
    onSuccess: ({ result, profile }) => {
      // Select the house that was just created (result.houseId)
      setProfile(profile, result.houseId)
      router.push(ROUTES.ADMIN_HOME)
      toast.success('Cadastro realizado com sucesso!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao realizar cadastro'))
    },
  })
}

export function useProfile() {
  const { setProfile, isAuthenticated, isProfileStale } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await authService.getProfile()
      if (!data.houses?.length) {
        // Membro removido/inativado: encerra a sessão em vez de abrir telas sem casa
        toast.error('Sua conta não está vinculada a nenhuma casa ativa.')
        await authService.logout()
        throw new Error('Sem casa ativa')
      }
      setProfile(data)
      return data
    },
    enabled: isAuthenticated,
    staleTime: isProfileStale ? 0 : 5 * 60 * 1000,
    // Volta para a aba -> confere papel/permissões de novo
    refetchOnWindowFocus: true,
    retry: false,
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Ainda logado: tira o token de push deste navegador antes de sair.
      await disableWebPush().catch(() => undefined)
      return authService.logout()
    },
    onSettled: async () => {
      // signOut já invalida a sessão do Firebase (onIdTokenChanged emite null).
      // Limpamos estado local e todo o cache de queries para não vazar dados
      // da sessão anterior para o próximo usuário do navegador.
      clearAuth()
      await queryClient.cancelQueries()
      queryClient.clear()
      router.replace(ROUTES.LOGIN)
    },
  })
}

/**
 * Em telas públicas de entrada ("/" e "/login"): quem já tem sessão vai direto
 * para a home da área certa. Devolve `checking` enquanto o Firebase resolve a
 * sessão e `false` quando não há sessão (mostra a tela normalmente).
 */
export function useRedirectIfAuthenticated(fallback?: string) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const home = user ? getStoredHomeRoute() : null
      if (home) {
        router.replace(home === 'admin' ? ROUTES.ADMIN_HOME : ROUTES.MEMBER_HOME)
        return
      }
      if (fallback) {
        router.replace(fallback)
        return
      }
      setChecking(false)
    })
    return () => unsubscribe()
  }, [router, fallback])

  return checking
}
