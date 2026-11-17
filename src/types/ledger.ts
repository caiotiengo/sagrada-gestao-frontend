export type LedgerSource =
  | 'monthlyFee'
  | 'helpQuota'
  | 'externalContribution'
  | 'raffleReservation'
  | 'storeSale'
  | 'debt'
  | 'shoppingItem'
  | 'payment'
  | 'memberCharge'
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
  /** true quando este lançamento é o estorno de outro (`reverses`). */
  isReversal: boolean
  /** Data real do fato (pagamento/estorno). Ordenação e filtros usam este campo. */
  occurredAt: string
  createdAt: string
  confirmedAt: string | null
  reversedBy: string | null
  reverses: string | null
  /** "receipt" quando a baixa veio de um comprovante PIX (back novo; ausente no antigo). */
  origin?: 'receipt' | null
  receiptId?: string | null
}

export interface PendingTotalsByType {
  fees: { amount: number; count: number }
  debts: { amount: number; count: number }
  quotas: { amount: number; count: number }
  sales: { amount: number; count: number }
  shopping: { amount: number; count: number }
  /** Reservas de rifa não pagas (back novo). */
  raffles?: { amount: number; count: number }
}

export interface AggregateByDirection {
  credit: number
  debit: number
}

export interface FinancialStatement {
  balance: { revenue: number; expense: number; net: number }
  pending: {
    amount: number
    count: number
    byType: PendingTotalsByType
    /** Mensalidades de competências futuras ainda não vencidas (fora do total). */
    upcomingFees: { amount: number; count: number }
  }
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
  ledger: { credit: number; debit: number; net: number; entriesCount: number }
  entities: {
    credit: number
    debit: number
    byType: {
      fees: number
      sales: number
      quotas: number
      contributions: number
      raffles: number
      shopping: number
      paymentsIncome: number
      paymentsExpense: number
      memberChargesExpense: number
    }
  }
  drift: { credit: number; debit: number; net: number }
}

export interface ReconcileSummaryResult {
  totalRevenue: number
  totalExpense: number
  balance: number
  pendingFees: number
  entriesCount: number
}

export interface ReverseLedgerEntryRequest {
  houseId: string
  entryId: string
  reason: string
}

export interface ReverseLedgerEntryResult {
  reversalId: string | null
  originalId: string
  created: boolean
}

export interface BackfillDrift {
  source: string
  sourceId: string
  expected: number
  ledger: number
}

export interface BackfillResult {
  backfill: {
    houseId: string
    created: Partial<Record<LedgerSource, number>>
    skipped: Partial<Record<LedgerSource, number>>
    totalCreated: number
    totalSkipped: number
    /** Ledger com MAIS do que a entidade: nada foi lançado, precisa de estorno manual. */
    drift: BackfillDrift[]
    /** Casos que o backfill não conseguiu decidir sozinho. */
    ambiguous: Array<{ source: string; sourceId: string }>
  }
  validation: LedgerValidationResult
}
