'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { campaignsService } from '@/services/campaigns'
import type {
  CreateCampaignRequest,
  UpdateCampaignRequest,
  AssignQuotaRequest,
  AssignQuotaWithPixRequest,
  PayQuotaRequest,
  RegisterExternalContributionRequest,
  UpdateContributionStatusRequest,
  DeleteCampaignRequest,
  CampaignStatus,
} from '@/types'
import { toast } from 'sonner'

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
    onError: () => {
      toast.error('Erro ao criar lista')
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
    onError: () => {
      toast.error('Erro ao atualizar lista')
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
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Cota atribuída')
    },
    onError: () => {
      toast.error('Erro ao atribuir cota')
    },
  })
}

export function useAssignQuotaWithPix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AssignQuotaWithPixRequest) =>
      campaignsService.assignQuotaWithPix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('QR Code PIX gerado!')
    },
    onError: () => {
      toast.error('Erro ao gerar PIX')
    },
  })
}

export function useQuotaPaymentStatus(quotaId: string | null) {
  return useQuery({
    queryKey: ['quota-payment-status', quotaId],
    queryFn: () => campaignsService.getQuotaPaymentStatus({ quotaId: quotaId! }),
    enabled: !!quotaId,
    refetchInterval: 5000,
  })
}

export function usePayQuota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PayQuotaRequest) =>
      campaignsService.payQuota(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Pagamento de cota registrado')
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento de cota')
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
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Contribuição externa registrada')
    },
    onError: () => {
      toast.error('Erro ao registrar contribuição externa')
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
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions'] })
      toast.success('Status da contribuição atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar status da contribuição')
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
      toast.success('Lista cancelada')
    },
    onError: () => {
      toast.error('Erro ao cancelar lista')
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
