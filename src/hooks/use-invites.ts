'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { invitesService } from '@/services/invites'
import type {
  CreateInviteRequest,
  RegisterByInviteRequest,
  RevokeInviteRequest,
  InviteStatus,
} from '@/types'
import { toast } from 'sonner'

export function useValidateInvite(token: string, houseSlug: string) {
  return useQuery({
    queryKey: ['invite', 'validate', token, houseSlug],
    queryFn: () => invitesService.validateInvite({ token, houseSlug }),
    enabled: !!token && !!houseSlug,
    retry: false,
  })
}

export function useRegisterByInvite() {
  return useMutation({
    mutationFn: (data: RegisterByInviteRequest & { email: string; password: string }) =>
      invitesService.registerByInvite(data),
    onSuccess: () => {
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.')
    },
    onError: () => {
      toast.error('Erro ao realizar cadastro')
    },
  })
}

export function useInvites(page = 1, status?: InviteStatus) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['invites', houseId, page, status],
    queryFn: () => invitesService.listInvites({ houseId: houseId!, page, limit: 20, status }),
    enabled: !!houseId,
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInviteRequest) => invitesService.createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] })
    },
    onError: () => {
      toast.error('Erro ao criar convite')
    },
  })
}

export function useRevokeInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RevokeInviteRequest) => invitesService.revokeInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] })
      toast.success('Convite revogado')
    },
    onError: () => {
      toast.error('Erro ao revogar convite')
    },
  })
}
