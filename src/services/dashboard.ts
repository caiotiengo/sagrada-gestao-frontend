import { callFunction } from '@/lib/callable'
import type {
  GetDashboardSummaryRequest,
  DashboardSummary,
  RecalculateHouseSummaryResponse,
} from '@/types'

export const dashboardService = {
  getDashboardSummary: (data: GetDashboardSummaryRequest) =>
    callFunction<GetDashboardSummaryRequest, DashboardSummary>('getDashboardSummary', data),

  recalculateHouseSummary: (data: { houseId: string }) =>
    callFunction<{ houseId: string }, RecalculateHouseSummaryResponse>('recalculateHouseSummary', data),
}
