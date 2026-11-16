'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { campaignsService } from '@/services/campaigns'
import type {
  CreateCampaignRequest,
  UpdateCampaignRequest,
  AssignQuotaRequest,
  PayQuotaRequest,
  RegisterExternalContributionRequest,
  UpdateContributionStatusRequest,
  DeleteCampaignRequest,
  DeleteContributionRequest,
  CampaignStatus,
} from '@/types'
import { toast } from 'sonner'
import { invalidateFinance } from '@/lib/invalidate'
import { getErrorMessage } from '@/lib/errors'

export function useCampaigns(page = 1, status?: CampaignStatus) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['campaigns', houseId, page, status],
    queryFn: () =>
      campaignsService.listCampaigns({
        houseId: houseId!,
        page,
        limit: 20,
        status,
      }),
    enabled: !!houseId,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCampaignRequest) =>
      campaignsService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Lista criada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar lista'))
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCampaignRequest) =>
      campaignsService.updateCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Lista atualizada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar lista'))
    },
  })
}

export function useAssignQuota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AssignQuotaRequest) =>
      campaignsService.assignQuota(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] })
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Cota atribuída')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atribuir cota'))
    },
  })
}

export function usePayQuota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PayQuotaRequest) =>
      campaignsService.payQuota(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] })
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Pagamento de cota registrado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar pagamento de cota'))
    },
  })
}

export function useRegisterExternalContribution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterExternalContributionRequest) =>
      campaignsService.registerExternalContribution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Contribuição externa registrada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar contribuição externa'))
    },
  })
}

export function useUpdateContributionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateContributionStatusRequest) =>
      campaignsService.updateContributionStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Status da contribuição atualizado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar status da contribuição'))
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteCampaignRequest) =>
      campaignsService.deleteCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      invalidateFinance(queryClient)
      toast.success('Lista cancelada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao cancelar lista'))
    },
  })
}

export function useCampaignContributions(
  campaignId: string,
  page = 1,
  type?: 'member' | 'external',
) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['campaign-contributions', houseId, campaignId, page, type],
    queryFn: () =>
      campaignsService.listCampaignContributions({
        houseId: houseId!,
        campaignId,
        page,
        limit: 20,
        type,
      }),
    enabled: !!houseId && !!campaignId,
  })
}

export function useDeleteContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DeleteContributionRequest) => campaignsService.deleteContribution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Contribuição excluída com sucesso')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir contribuição'))
    },
  })
}

export function useQuotas(campaignId: string, page = 1, status?: 'pending' | 'partial' | 'paid') {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['quotas', houseId, campaignId, page, status],
    queryFn: () =>
      campaignsService.listQuotas({
        houseId: houseId!,
        campaignId,
        page,
        limit: 20,
        status,
      }),
    enabled: !!houseId && !!campaignId,
  })
}
