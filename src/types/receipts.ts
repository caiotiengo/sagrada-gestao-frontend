/** Comprovante PIX enviado pelo filho (formato de `toReceiptView` no back). */

export type ReceiptStatus =
  | 'processing'
  | 'auto_approved'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'reversed'

export type ReceiptContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'

export type ReceiptItemType =
  | 'monthlyFee'
  | 'debt'
  | 'storeTab'
  | 'storeOrder'
  | 'helpQuota'
  | 'shoppingItem'
  | 'raffleReservation'

export interface ReceiptCheck {
  code: string
  status: 'ok' | 'fail' | 'warn' | 'skip'
  message: string
}

export interface ReceiptLine {
  type: ReceiptItemType
  id: string
  description: string
  openCents: number
  appliedCents: number
  partial: boolean
}

export interface ReceiptSuggestion {
  strategy: 'exact' | 'combination' | 'fifo' | 'none' | 'manual'
  lines: ReceiptLine[]
  allocatedCents: number
  leftoverCents: number
}

export interface ReceiptDecision {
  mode: 'auto' | 'manual'
  by: string | null
  at: string | null
  outcome: 'approved' | 'rejected'
  adjusted?: boolean
}

export interface ReceiptView {
  id: string
  houseId: string
  memberId: string
  memberName: string | null
  status: ReceiptStatus
  amountCents: number | null
  paidAt: string | null
  e2eId: string | null
  receiverName: string | null
  receiverInstitution: string | null
  payerName: string | null
  payerInstitution: string | null
  destinationKey: string | null
  contentType: ReceiptContentType | null
  hasFile: boolean
  checks: ReceiptCheck[]
  confidence: number | null
  suggestion: ReceiptSuggestion | null
  applied: ReceiptLine[]
  leftoverCents: number
  decision: ReceiptDecision | null
  rejectionReason: string | null
  reversal: { reason: string; at: string | null } | null
  note: string | null
  createdAt: string | null
  /** Só para quem cuida do caixa. */
  model?: string | null
  escalated?: boolean
  editSignals?: string[]
}

export interface ReceiptOpenItem {
  type: ReceiptItemType
  id: string
  description: string
  openCents: number
  partialAllowed: boolean
}

export type ReceiptListFilter = 'review' | 'settled' | 'rejected' | 'reversed' | 'all'

export interface ReceiptSettings {
  mode: 'auto' | 'review'
  maxAutoAmountCents: number
  autoReadAvailable: boolean
  defaults: { mode: 'auto' | 'review'; maxAutoAmountCents: number }
}

export interface SubmitReceiptRequest {
  houseId: string
  fileBase64: string
  contentType: ReceiptContentType
  fileName?: string
  origin?: 'gallery' | 'camera' | 'file' | 'share' | 'web'
}

export interface ApproveReceiptRequest {
  houseId: string
  receiptId: string
  amountCents?: number
  items?: { type: ReceiptItemType; id: string; amountCents: number }[]
  note?: string
}
