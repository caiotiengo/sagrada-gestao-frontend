'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/public'
import type { PublicRegisterContributionRequest, PublicReserveRaffleNumbersRequest, PublicStoreOrderRequest } from '@/types'
import { toast } from 'sonner'
import { trackContribution, trackRaffleReservation, trackStoreOrder } from '@/lib/analytics'

export function usePublicHouse(slug: string) {
  return useQuery({
    queryKey: ['house', 'public', slug],
    queryFn: () => publicService.getPublicHouse({ houseSlug: slug }),
    enabled: !!slug,
  })
}

export function usePublicCampaign(houseSlug: string, campaignSlug: string) {
  return useQuery({
    queryKey: ['campaign', 'public', houseSlug, campaignSlug],
    queryFn: () => publicService.getPublicCampaign({ houseSlug, campaignSlug }),
    enabled: !!houseSlug && !!campaignSlug,
  })
}

export function useCampaignContribute() {
  return useMutation({
    mutationFn: (data: PublicRegisterContributionRequest) =>
      publicService.publicRegisterContribution(data),
    onSuccess: (data, variables) => {
      if (!data.duplicate) {
        toast.success('Contribuição registrada com sucesso!')
        trackContribution(variables.campaignSlug, variables.amount)
      }
    },
    onError: () => {
      toast.error('Erro ao registrar contribuição')
    },
  })
}

export function usePublicRaffle(houseSlug: string, raffleSlug: string) {
  return useQuery({
    queryKey: ['raffle', 'public', houseSlug, raffleSlug],
    queryFn: () => publicService.getPublicRaffle({ houseSlug, raffleSlug }),
    enabled: !!houseSlug && !!raffleSlug,
  })
}

export function useRaffleReservation() {
  return useMutation({
    mutationFn: (data: PublicReserveRaffleNumbersRequest) =>
      publicService.publicReserveRaffleNumbers(data),
    onSuccess: (data, variables) => {
      if (!data.duplicate) {
        toast.success('Números reservados com sucesso!')
        trackRaffleReservation(variables.raffleSlug, variables.numbers.length, data.totalAmount)
      }
    },
    onError: () => {
      toast.error('Erro ao reservar números')
    },
  })
}

export function usePublicStore(houseSlug: string) {
  return useQuery({
    queryKey: ['store', 'public', houseSlug],
    queryFn: () => publicService.publicListStoreItems({ houseSlug }),
    enabled: !!houseSlug,
  })
}

export function usePublicStoreMembers(houseSlug: string) {
  return useQuery({
    queryKey: ['store-members', 'public', houseSlug],
    queryFn: () => publicService.publicListStoreMembers({ houseSlug }),
    enabled: !!houseSlug,
  })
}

export function usePublicEvents(houseSlug: string) {
  return useQuery({
    queryKey: ['events', 'public', houseSlug],
    queryFn: () => publicService.publicListEvents({ houseSlug }),
    enabled: !!houseSlug,
  })
}

export function usePublicRaffles(houseSlug: string) {
  return useQuery({
    queryKey: ['raffles', 'public', houseSlug],
    queryFn: () => publicService.publicListRaffles({ houseSlug }),
    enabled: !!houseSlug,
  })
}

export function usePublicCampaigns(houseSlug: string) {
  return useQuery({
    queryKey: ['campaigns', 'public', houseSlug],
    queryFn: () => publicService.publicListCampaigns({ houseSlug }),
    enabled: !!houseSlug,
  })
}

export function usePublicStoreOrder() {
  return useMutation({
    mutationFn: (data: PublicStoreOrderRequest) =>
      publicService.publicCreateStoreOrder(data),
    onSuccess: (data, variables) => {
      if (!data.duplicate) {
        toast.success('Pedido realizado com sucesso!')
        trackStoreOrder(variables.items.length, data.orderTotal)
      }
    },
    onError: () => {
      toast.error('Erro ao realizar pedido')
    },
  })
}
