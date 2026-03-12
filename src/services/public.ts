import { callFunction } from '@/lib/callable'
import type {
  GetPublicHouseRequest,
  PublicHouse,
  GetPublicCampaignRequest,
  PublicCampaign,
  GetPublicRaffleRequest,
  PublicRaffle,
  PublicReserveRaffleNumbersRequest,
  ReserveRaffleNumbersResponse,
  PublicRegisterContributionRequest,
  PublicRegisterContributionResponse,
  PublicStoreData,
  PublicStoreOrderRequest,
  PublicStoreOrderResponse,
  PublicStoreMembersData,
} from '@/types'

export const publicService = {
  getPublicHouse: (data: GetPublicHouseRequest) =>
    callFunction<GetPublicHouseRequest, PublicHouse>('getPublicHouse', data),

  getPublicCampaign: (data: GetPublicCampaignRequest) =>
    callFunction<GetPublicCampaignRequest, PublicCampaign>('getPublicCampaign', data),

  getPublicRaffle: (data: GetPublicRaffleRequest) =>
    callFunction<GetPublicRaffleRequest, PublicRaffle>('getPublicRaffle', data),

  publicReserveRaffleNumbers: (data: PublicReserveRaffleNumbersRequest) =>
    callFunction<PublicReserveRaffleNumbersRequest, ReserveRaffleNumbersResponse>('publicReserveRaffleNumbers', data),

  publicRegisterContribution: (data: PublicRegisterContributionRequest) =>
    callFunction<PublicRegisterContributionRequest, PublicRegisterContributionResponse>('publicRegisterContribution', data),

  publicListStoreItems: (data: { houseSlug: string }) =>
    callFunction<{ houseSlug: string }, PublicStoreData>('publicListStoreItems', data),

  publicCreateStoreOrder: (data: PublicStoreOrderRequest) =>
    callFunction<PublicStoreOrderRequest, PublicStoreOrderResponse>('publicCreateStoreOrder', data),

  publicListStoreMembers: (data: { houseSlug: string }) =>
    callFunction<{ houseSlug: string }, PublicStoreMembersData>('publicListStoreMembers', data),
}
