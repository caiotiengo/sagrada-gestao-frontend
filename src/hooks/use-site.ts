'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { siteService } from '@/services/site'
import type { UpdateHouseSiteConfigRequest } from '@/types'
import { toast } from 'sonner'

export function useHouseBySubdomain(subdomain: string) {
  return useQuery({
    queryKey: ['house', 'subdomain', subdomain],
    queryFn: () => siteService.getHouseBySubdomain(subdomain),
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutes - site data doesn't change often
  })
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateHouseSiteConfigRequest) =>
      siteService.updateHouseSiteConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['house'] })
      toast.success('Configurações do site atualizadas')
    },
    onError: () => {
      toast.error('Erro ao atualizar configurações do site')
    },
  })
}

export function useCheckSubdomain(subdomain: string) {
  return useQuery({
    queryKey: ['subdomain', 'check', subdomain],
    queryFn: () => siteService.checkSubdomainAvailability({ subdomain }),
    enabled: !!subdomain && subdomain.length >= 3,
    staleTime: 10 * 1000, // 10 seconds
  })
}
