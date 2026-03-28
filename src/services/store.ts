import { callFunction } from '@/lib/callable'
import type {
  CreateStoreItemRequest,
  StoreItem,
  UpdateStoreItemRequest,
  ListStoreItemsRequest,
  RegisterSaleRequest,
  RegisterSaleResponse,
  ListSalesRequest,
  SaleItem,
  PaySaleRequest,
  UpdateSaleStatusRequest,
  GetSalesSummaryRequest,
  SalesSummary,
  DeleteStoreItemRequest,
  DeleteSaleRequest,
  PaginatedResponse,
} from '@/types'

export const storeService = {
  createStoreItem: (data: CreateStoreItemRequest) =>
    callFunction<CreateStoreItemRequest, StoreItem>('createStoreItem', data),

  updateStoreItem: (data: UpdateStoreItemRequest) =>
    callFunction<UpdateStoreItemRequest, StoreItem>('updateStoreItem', data),

  listStoreItems: (data: ListStoreItemsRequest) =>
    callFunction<ListStoreItemsRequest, PaginatedResponse<StoreItem>>('listStoreItems', data),

  registerSale: (data: RegisterSaleRequest) =>
    callFunction<RegisterSaleRequest, RegisterSaleResponse>('registerSale', data),

  listSales: (data: ListSalesRequest) =>
    callFunction<ListSalesRequest, PaginatedResponse<SaleItem>>('listSales', data),

  paySale: (data: PaySaleRequest) =>
    callFunction<PaySaleRequest, { saleId: string; isPaid: boolean; paymentMethod: string }>('paySale', data),

  getSalesSummary: (data: GetSalesSummaryRequest) =>
    callFunction<GetSalesSummaryRequest, SalesSummary>('getSalesSummary', data),

  updateSaleStatus: (data: UpdateSaleStatusRequest) =>
    callFunction<UpdateSaleStatusRequest, { saleId: string; status: string; memberId: string | null }>('updateSaleStatus', data),

  deleteStoreItem: (data: DeleteStoreItemRequest) =>
    callFunction<DeleteStoreItemRequest, { deleted: true }>('deleteStoreItem', data),

  deleteSale: (data: DeleteSaleRequest) =>
    callFunction<DeleteSaleRequest, { saleId: string; deleted: true }>('deleteSale', data),
}
