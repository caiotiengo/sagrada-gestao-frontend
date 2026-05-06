export type LedgerSource =
  | 'monthlyFee'
  | 'helpQuota'
  | 'externalContribution'
  | 'raffleReservation'
  | 'storeSale'
  | 'debt'
  | 'shoppingItem'
  | 'payment'
  | 'manual'

export type LedgerDirection = 'credit' | 'debit'

export type LedgerStatus = 'confirmed' | 'pending' | 'reversed'

export type LedgerChannel =
  | 'cash'
  | 'pix'
  | 'card'
  | 'transfer'
  | 'internal'
  | 'other'

export interface LedgerEntryView {
  id: string
  houseId: string
  memberId: string | null
  amount: number
  direction: LedgerDirection
  source: LedgerSource
  sourceId: string
  status: LedgerStatus
  channel: LedgerChannel
  description: string
  createdAt: string
  confirmedAt: string | null
  reversedBy: string | null
  reverses: string | null
}

export interface PendingTotalsByType {
  fees: { amount: number; count: number }
  debts: { amount: number; count: number }
  quotas: { amount: number; count: number }
  sales: { amount: number; count: number }
  shopping: { amount: number; count: number }
}

export interface AggregateByDirection {
  credit: number
  debit: number
}

export interface FinancialStatement {
  balance: { revenue: number; expense: number; net: number }
  pending: { amount: number; count: number; byType: PendingTotalsByType }
  aggregatesByType: Partial<Record<LedgerSource, AggregateByDirection>>
  data: LedgerEntryView[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface FinancialStatementFilters {
  houseId: string
  memberId?: string
  source?: LedgerSource
  direction?: LedgerDirection
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface LedgerFilters {
  houseId: string
  memberId?: string
  source?: LedgerSource
  status?: LedgerStatus
  direction?: LedgerDirection
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface LedgerListResponse {
  data: LedgerEntryView[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface LedgerValidationResult {
  houseId: string
  isBalanced: boolean
  ledger: { credit: number; debit: number; net: number; byType: Partial<Record<LedgerSource, AggregateByDirection>> }
  entities: { credit: number; debit: number; net: number; byType: Partial<Record<LedgerSource, AggregateByDirection>> }
  drift: { credit: number; debit: number; net: number }
  validatedAt: string
}

export interface ReconcileSummaryResult {
  houseId: string
  reconciledAt: string
  summary: {
    totalRevenue: number
    totalExpense: number
    pendingCount: number
    pendingAmount: number
  }
}

export interface ReverseLedgerEntryRequest {
  houseId: string
  entryId: string
  reason: string
}

export interface ReverseLedgerEntryResult {
  reversalEntryId: string
  reversedEntryId: string
}

export interface BackfillResult {
  houseId: string
  backfill: {
    created: Partial<Record<LedgerSource, number>>
    skipped: Partial<Record<LedgerSource, number>>
    errors: Array<{ source: string; id: string; message: string }>
    totalCreated: number
    totalSkipped: number
  }
  validation: LedgerValidationResult
}
