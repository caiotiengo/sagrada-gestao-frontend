import { callFunction } from '@/lib/callable'
import type { UpdateHouseSiteConfigRequest, CheckSubdomainRequest, CheckSubdomainResponse, PublicHouse } from '@/types'

export const siteService = {
  updateHouseSiteConfig: (data: UpdateHouseSiteConfigRequest) =>
    callFunction<UpdateHouseSiteConfigRequest, { message: string }>('updateHouseSiteConfig', data),

  checkSubdomainAvailability: (data: CheckSubdomainRequest) =>
    callFunction<CheckSubdomainRequest, CheckSubdomainResponse>('checkSubdomainAvailability', data),

  getHouseBySubdomain: (subdomain: string) =>
    callFunction<{ subdomain: string }, PublicHouse>('publicGetHouseBySubdomain', { subdomain }),
}
