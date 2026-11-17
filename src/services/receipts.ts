import { callFunction } from '@/lib/callable'
import type {
  ApproveReceiptRequest,
  ReceiptListFilter,
  ReceiptOpenItem,
  ReceiptSettings,
  ReceiptView,
  SubmitReceiptRequest,
} from '@/types/receipts'

type Ref = { houseId: string; receiptId: string }

export const receiptsService = {
  submit: (data: SubmitReceiptRequest) => callFunction<SubmitReceiptRequest, ReceiptView>('submitPaymentReceipt', data),

  listMine: (data: { houseId: string; limit?: number }) =>
    callFunction<typeof data, { receipts: ReceiptView[] }>('listMyReceipts', data),

  get: (data: Ref) =>
    callFunction<Ref, { receipt: ReceiptView; openItems: ReceiptOpenItem[] | null }>('getReceipt', data),

  getFile: (data: Ref) =>
    callFunction<Ref, { contentType: string; fileBase64: string; size: number }>('getReceiptFile', data),

  listHouse: (data: { houseId: string; filter: ReceiptListFilter; memberId?: string; limit?: number }) =>
    callFunction<typeof data, { receipts: ReceiptView[]; pendingReviewCount: number }>('listHouseReceipts', data),

  approve: (data: ApproveReceiptRequest) => callFunction<ApproveReceiptRequest, ReceiptView>('approveReceipt', data),

  reject: (data: Ref & { reason: string }) => callFunction<typeof data, ReceiptView>('rejectReceipt', data),

  reverse: (data: Ref & { reason: string }) => callFunction<typeof data, ReceiptView>('reverseReceipt', data),

  getSettings: (data: { houseId: string }) => callFunction<typeof data, ReceiptSettings>('getReceiptSettings', data),

  updateSettings: (data: { houseId: string; mode: 'auto' | 'review'; maxAutoAmountCents: number }) =>
    callFunction<typeof data, ReceiptSettings>('updateReceiptSettings', data),
}
