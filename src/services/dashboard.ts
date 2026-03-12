import { callFunction } from '@/lib/callable'
import type { GetDashboardSummaryRequest, DashboardSummary } from '@/types'

export const dashboardService = {
  getDashboardSummary: (data: GetDashboardSummaryRequest) =>
    callFunction<GetDashboardSummaryRequest, DashboardSummary>('getDashboardSummary', data),
}
