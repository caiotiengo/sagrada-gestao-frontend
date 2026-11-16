'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { storeService } from '@/services/store'
import type {
  CreateStoreItemRequest,
  UpdateStoreItemRequest,
  RegisterSaleRequest,
  RegisterSaleBatchRequest,
  PaySaleRequest,
  UpdateSaleStatusRequest,
  DeleteStoreItemRequest,
  DeleteSaleRequest,
  SaleStatus,
  StoreCategory,
  AdjustStoreItemStockRequest,
  MarkOrderReadyRequest,
} from '@/types'
import { toast } from 'sonner'
import { invalidateFinance } from '@/lib/invalidate'
import { getErrorMessage } from '@/lib/errors'

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
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar item'))
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
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar item'))
    },
  })
}

export function useAdjustStoreItemStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdjustStoreItemStockRequest) =>
      storeService.adjustStoreItemStock(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success(`Estoque ajustado: ${result.previousStock} → ${result.stock}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao ajustar estoque'))
    },
  })
}

export function useMarkOrderReady() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkOrderReadyRequest) => storeService.markOrderReady(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      toast.success(variables.isReady ? 'Pedido marcado como pronto' : 'Pedido desmarcado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao marcar pedido'))
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
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Venda registrada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar venda'))
    },
  })
}

export function useRegisterSaleBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterSaleBatchRequest) =>
      storeService.registerSaleBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Venda registrada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar venda'))
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
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      toast.success('Venda quitada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao quitar venda'))
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
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      toast.success('Status da venda atualizado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar status da venda'))
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
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir item'))
    },
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DeleteSaleRequest) => storeService.deleteSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      invalidateFinance(queryClient)
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] })
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Venda excluída — estoque devolvido')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir venda'))
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
