'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { membersService } from '@/services/members'
import type { UpdateMemberPermissionsRequest, UserRole } from '@/types'
import { toast } from 'sonner'

export function useMembers(page = 1, search?: string, role?: UserRole) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['members', houseId, page, search, role],
    queryFn: () =>
      membersService.listMembers({
        houseId: houseId!,
        page,
        limit: 20,
        search,
        role,
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
    onError: () => {
      toast.error('Erro ao atualizar permissões')
    },
  })
}
