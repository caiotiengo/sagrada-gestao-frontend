import { callFunction } from '@/lib/callable'

interface CoraBalanceResponse {
  balance: number
  blockedBalance: number
}

interface CoraStatementEntry {
  id: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  createdAt: string
  transaction?: {
    description?: string
    counterParty?: {
      name?: string
    }
  }
}

interface CoraStatementResponse {
  start?: { balance: number }
  end?: { balance: number }
  entries: CoraStatementEntry[]
  aggregations?: {
    creditTotal: number
    debitTotal: number
  }
}

interface GetCoraStatementRequest {
  houseId: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const coraService = {
  getBalance: (data: { houseId: string }) =>
    callFunction<{ houseId: string }, CoraBalanceResponse>('getCoraBalance', data),

  getStatement: (data: GetCoraStatementRequest) =>
    callFunction<GetCoraStatementRequest, CoraStatementResponse>('getCoraStatement', data),
}
