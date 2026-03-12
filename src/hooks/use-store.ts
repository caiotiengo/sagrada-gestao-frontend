'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { storeService } from '@/services/store'
import type {
  CreateStoreItemRequest,
  UpdateStoreItemRequest,
  RegisterSaleRequest,
  PaySaleRequest,
  UpdateSaleStatusRequest,
  DeleteStoreItemRequest,
  SaleStatus,
  StoreCategory,
} from '@/types'
import { toast } from 'sonner'

export function useStoreItems(page = 1, category?: StoreCategory) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['store-items', houseId, page, category],
    queryFn: () =>
      storeService.listStoreItems({
        houseId: houseId!,
        page,
        limit: 20,
        category,
      }),
    enabled: !!houseId,
    refetchInterval: 30_000,
  })
}

export function useCreateStoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStoreItemRequest) =>
      storeService.createStoreItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Item criado')
    },
    onError: () => {
      toast.error('Erro ao criar item')
    },
  })
}

export function useUpdateStoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateStoreItemRequest) =>
      storeService.updateStoreItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Item atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar item')
    },
  })
}

export function useRegisterSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterSaleRequest) =>
      storeService.registerSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Venda registrada')
    },
    onError: () => {
      toast.error('Erro ao registrar venda')
    },
  })
}

export function useSales(
  page = 1,
  itemId?: string,
  isPaid?: boolean,
  startDate?: string,
  endDate?: string,
  status?: SaleStatus,
  source?: 'internal' | 'public',
  category?: StoreCategory,
) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['sales', houseId, page, itemId, isPaid, startDate, endDate, status, source, category],
    queryFn: () =>
      storeService.listSales({
        houseId: houseId!,
        page,
        limit: 20,
        itemId,
        isPaid,
        startDate,
        endDate,
        status,
        source,
        category,
      }),
    enabled: !!houseId,
    refetchInterval: 30_000,
  })
}

export function usePaySale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaySaleRequest) =>
      storeService.paySale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      toast.success('Venda quitada')
    },
    onError: () => {
      toast.error('Erro ao quitar venda')
    },
  })
}

export function useUpdateSaleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSaleStatusRequest) =>
      storeService.updateSaleStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      toast.success('Status da venda atualizado')
    },
    onError: () => {
      toast.error('Erro ao atualizar status da venda')
    },
  })
}

export function useDeleteStoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteStoreItemRequest) =>
      storeService.deleteStoreItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Item excluído')
    },
    onError: () => {
      toast.error('Erro ao excluir item')
    },
  })
}

export function useMemberSales(memberId: string | undefined, page = 1, category?: StoreCategory) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['sales', houseId, 'member', memberId, page, category],
    queryFn: () =>
      storeService.listSales({
        houseId: houseId!,
        memberId,
        category,
        page,
        limit: 20,
      }),
    enabled: !!houseId && !!memberId,
    refetchInterval: 30_000,
  })
}

export function useSalesSummary(date: string, category?: StoreCategory) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['sales-summary', houseId, date, category],
    queryFn: () =>
      storeService.getSalesSummary({
        houseId: houseId!,
        date,
        category,
      }),
    enabled: !!houseId && !!date,
    refetchInterval: 30_000,
  })
}
