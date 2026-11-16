import { callFunction } from '@/lib/callable'
import type {
  RegisterCheckinResponse,
  RegisterBulkCheckinResponse,
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
    callFunction<RegisterCheckinRequest, RegisterCheckinResponse>('registerCheckin', data),

  registerBulkCheckin: (data: RegisterBulkCheckinRequest) =>
    callFunction<RegisterBulkCheckinRequest, RegisterBulkCheckinResponse>('registerBulkCheckin', data),

  listCheckins: (data: ListCheckinsRequest) =>
    callFunction<ListCheckinsRequest, PaginatedResponse<CheckinItem>>('listCheckins', data),

  getMemberCheckinSummary: (data: GetMemberCheckinSummaryRequest) =>
    callFunction<GetMemberCheckinSummaryRequest, CheckinSummary>('getMemberCheckinSummary', data),
}
