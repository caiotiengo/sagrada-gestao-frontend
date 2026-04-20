import { callFunction } from '@/lib/callable'
import type {
  FinancialStatement,
  FinancialStatementFilters,
  LedgerFilters,
  LedgerListResponse,
  LedgerValidationResult,
  ReconcileSummaryResult,
  ReverseLedgerEntryRequest,
  ReverseLedgerEntryResult,
  BackfillResult,
} from '@/types/ledger'

export const ledgerService = {
  getFinancialStatement: (data: FinancialStatementFilters) =>
    callFunction<FinancialStatementFilters, FinancialStatement>('getFinancialStatement', data),

  getLedger: (data: LedgerFilters) =>
    callFunction<LedgerFilters, LedgerListResponse>('getLedger', data),

  validateHouseLedger: (data: { houseId: string }) =>
    callFunction<{ houseId: string }, LedgerValidationResult>('validateHouseLedger', data),

  reconcileHouseSummaryFromLedger: (data: { houseId: string }) =>
    callFunction<{ houseId: string }, ReconcileSummaryResult>('reconcileHouseSummaryFromLedger', data),

  reverseLedgerEntry: (data: ReverseLedgerEntryRequest) =>
    callFunction<ReverseLedgerEntryRequest, ReverseLedgerEntryResult>('reverseLedgerEntry', data),

  backfillHouseLedger: (data: { houseId: string }) =>
    callFunction<{ houseId: string }, BackfillResult>('backfillHouseLedger', data),
}
