'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { membersService } from '@/services/members'
import type {
  ChangeMemberRoleRequest,
  SetMemberActiveRequest,
  TransferHouseOwnershipRequest,
  UpdateMemberPermissionsRequest,
  UserRole,
} from '@/types'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'

export function useMembers(page = 1, search?: string, role?: UserRole, isActive?: boolean) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['members', houseId, page, search, role, isActive],
    queryFn: () =>
      membersService.listMembers({
        houseId: houseId!,
        page,
        limit: 20,
        search,
        role,
        isActive,
      }),
    enabled: !!houseId,
  })
}

export function useAllMembers() {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['members', houseId, 'all'],
    queryFn: () =>
      membersService.listMembers({
        houseId: houseId!,
        page: 1,
        limit: 100,
      }),
    select: (data) => ({
      ...data,
      data: [...(data.data ?? [])].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'pt-BR'),
      ),
    }),
    enabled: !!houseId,
  })
}

export function useMember(memberId: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['member', houseId, memberId],
    queryFn: () =>
      membersService.getMemberDetails({ houseId: houseId!, memberId }),
    enabled: !!houseId && !!memberId,
  })
}

export function useUpdateMemberPermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateMemberPermissionsRequest) =>
      membersService.updateMemberPermissions(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.houseId, variables.memberId] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Permissões atualizadas')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar permissões'))
    },
  })
}

/** Desativa (isActive=false) ou reativa. O histórico financeiro fica intacto. */
export function useSetMemberActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ active, ...data }: SetMemberActiveRequest & { active: boolean }) =>
      active ? membersService.reactivateMember(data) : membersService.deactivateMember(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.houseId, variables.memberId] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      toast.success(
        res.changed
          ? (res.isActive ? 'Membro reativado' : 'Membro desativado')
          : (res.isActive ? 'Membro já estava ativo' : 'Membro já estava desativado'),
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao alterar o status do membro'))
    },
  })
}

/**
 * Promove a Liderança ou devolve a Membro. O papel vale na hora no backend;
 * se a pessoa for você, o perfil é recarregado para trocar menus e acessos.
 */
export function useChangeMemberRole() {
  const queryClient = useQueryClient()
  const myMemberId = useAuthStore((s) => s.currentMemberId())

  return useMutation({
    mutationFn: (data: ChangeMemberRoleRequest) => membersService.changeMemberRole(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.houseId, variables.memberId] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      if (variables.memberId === myMemberId) {
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      }
      toast.success(
        !res.changed
          ? `Essa pessoa já é ${res.roleLabel}`
          : res.role === 'admin'
            ? 'Pronto: agora faz parte da Liderança'
            : 'Pronto: agora é Membro',
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Não foi possível mudar o papel'))
    },
  })
}

/** Passa a titularidade da casa para outra pessoa da Liderança. */
export function useTransferHouseOwnership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransferHouseOwnershipRequest) => membersService.transferHouseOwnership(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member', variables.houseId] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(res.changed ? `${res.newOwnerName ?? 'Essa pessoa'} agora é titular da casa` : 'Essa pessoa já é a titular')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Não foi possível passar a titularidade'))
    },
  })
}
