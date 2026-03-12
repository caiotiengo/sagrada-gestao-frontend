'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'
import type { RegisterHouseRequest } from '@/types'
import { ROUTES } from '@/constants'
import { toast } from 'sonner'

export function useLogin() {
  const { setProfile } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.login(data.email, data.password),
    onSuccess: (response) => {
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
    onError: () => {
      toast.error('Email ou senha inválidos')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authService.requestPasswordReset(data),
    onSuccess: () => {
      toast.success('Se o email existir, um link de recuperação será enviado.')
    },
    onError: () => {
      toast.error('Erro ao enviar email de recuperação')
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
    onError: () => {
      toast.error('Erro ao realizar cadastro')
    },
  })
}

export function useProfile() {
  const { setProfile, isAuthenticated, isProfileStale } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await authService.getProfile()
      setProfile(data)
      return data
    },
    enabled: isAuthenticated,
    staleTime: isProfileStale ? 0 : 5 * 60 * 1000,
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      router.push(ROUTES.LOGIN)
    },
  })
}
