import { callFunction } from '@/lib/callable'
import type {
  CreateMonthlyFeeRequest,
  MonthlyFeeItem,
  CreateBulkMonthlyFeesRequest,
  CreateBulkMonthlyFeesResponse,
  ListMonthlyFeesRequest,
  UpdateMonthlyFeeRequest,
  PayMonthlyFeeRequest,
  DeleteMonthlyFeeRequest,
  CreatePaymentRequest,
  PaymentItem,
  ListPaymentsRequest,
  DeletePaymentRequest,
  CreateDebtRequest,
  DebtItem,
  PayDebtRequest,
  PayDebtResponse,
  ListDebtsRequest,
  DeleteDebtRequest,
  ListFinancialStatementRequest,
  FinancialStatementResponse,
  GetMyFinancialSummaryRequest,
  MyFinancialSummary,
  PaginatedResponse,
  PaymentTag,
  CreatePaymentTagRequest,
  DeletePaymentTagRequest,
  CreateRecurringMonthlyFeeRequest,
  CreateRecurringMonthlyFeeResponse,
} from '@/types'

export const financeService = {
  createMonthlyFee: (data: CreateMonthlyFeeRequest) =>
    callFunction<CreateMonthlyFeeRequest, MonthlyFeeItem>('createMonthlyFee', data),

  createBulkMonthlyFees: (data: CreateBulkMonthlyFeesRequest) =>
    callFunction<CreateBulkMonthlyFeesRequest, CreateBulkMonthlyFeesResponse>('createBulkMonthlyFees', data),

  listMonthlyFees: (data: ListMonthlyFeesRequest) =>
    callFunction<ListMonthlyFeesRequest, PaginatedResponse<MonthlyFeeItem>>('listMonthlyFees', data),

  updateMonthlyFee: (data: UpdateMonthlyFeeRequest) =>
    callFunction<UpdateMonthlyFeeRequest, MonthlyFeeItem>('updateMonthlyFee', data),

  payMonthlyFee: (data: PayMonthlyFeeRequest) =>
    callFunction<PayMonthlyFeeRequest, MonthlyFeeItem>('payMonthlyFee', data),

  deleteMonthlyFee: (data: DeleteMonthlyFeeRequest) =>
    callFunction<DeleteMonthlyFeeRequest, { message: string }>('deleteMonthlyFee', data),

  createPayment: (data: CreatePaymentRequest) =>
    callFunction<CreatePaymentRequest, PaymentItem>('createPayment', data),

  listPayments: (data: ListPaymentsRequest) =>
    callFunction<ListPaymentsRequest, PaginatedResponse<PaymentItem>>('listPayments', data),

  deletePayment: (data: DeletePaymentRequest) =>
    callFunction<DeletePaymentRequest, { message: string }>('deletePayment', data),

  createDebt: (data: CreateDebtRequest) =>
    callFunction<CreateDebtRequest, DebtItem>('createDebt', data),

  payDebt: (data: PayDebtRequest) =>
    callFunction<PayDebtRequest, PayDebtResponse>('payDebt', data),

  deleteDebt: (data: DeleteDebtRequest) =>
    callFunction<DeleteDebtRequest, { message: string }>('deleteDebt', data),

  listDebts: (data: ListDebtsRequest) =>
    callFunction<ListDebtsRequest, PaginatedResponse<DebtItem>>('listDebts', data),

  listFinancialStatement: (data: ListFinancialStatementRequest) =>
    callFunction<ListFinancialStatementRequest, FinancialStatementResponse>('listFinancialStatement', data),

  getMyFinancialSummary: (data: GetMyFinancialSummaryRequest) =>
    callFunction<GetMyFinancialSummaryRequest, MyFinancialSummary>('getMyFinancialSummary', data),

  getMemberFinancialSummary: (data: GetMyFinancialSummaryRequest & { memberId: string }) =>
    callFunction<GetMyFinancialSummaryRequest & { memberId: string }, MyFinancialSummary>('getMemberFinancialSummary', data),

  listPaymentTags: (data: { houseId: string }) =>
    callFunction<{ houseId: string }, PaymentTag[]>('listPaymentTags', data),

  createPaymentTag: (data: CreatePaymentTagRequest) =>
    callFunction<CreatePaymentTagRequest, { tagId: string; name: string; type: string }>('createPaymentTag', data),

  deletePaymentTag: (data: DeletePaymentTagRequest) =>
    callFunction<DeletePaymentTagRequest, { tagId: string; deleted: boolean }>('deletePaymentTag', data),

  createRecurringMonthlyFee: (data: CreateRecurringMonthlyFeeRequest) =>
    callFunction<CreateRecurringMonthlyFeeRequest, CreateRecurringMonthlyFeeResponse>('createRecurringMonthlyFee', data),
}
