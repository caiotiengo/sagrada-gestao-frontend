import { callFunction } from '@/lib/callable'
import type {
  RegisterCheckinRequest,
  CheckinItem,
  RegisterBulkCheckinRequest,
  ListCheckinsRequest,
  GetMemberCheckinSummaryRequest,
  CheckinSummary,
  PaginatedResponse,
} from '@/types'

export const checkinsService = {
  registerCheckin: (data: RegisterCheckinRequest) =>
    callFunction<RegisterCheckinRequest, CheckinItem>('registerCheckin', data),

  registerBulkCheckin: (data: RegisterBulkCheckinRequest) =>
    callFunction<RegisterBulkCheckinRequest, { registered: number }>('registerBulkCheckin', data),

  listCheckins: (data: ListCheckinsRequest) =>
    callFunction<ListCheckinsRequest, PaginatedResponse<CheckinItem>>('listCheckins', data),

  getMemberCheckinSummary: (data: GetMemberCheckinSummaryRequest) =>
    callFunction<GetMemberCheckinSummaryRequest, CheckinSummary>('getMemberCheckinSummary', data),
}
