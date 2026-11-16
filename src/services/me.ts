import { callFunction } from '@/lib/callable'
import type { MyDashboard } from '@/types'

export const meService = {
  getMyDashboard: (data: { houseId: string }) =>
    callFunction<{ houseId: string }, MyDashboard>('getMyDashboard', data),
}
