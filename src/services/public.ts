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
  PublicReserveRaffleWithPixRequest,
  PublicReserveRaffleWithPixResponse,
  PublicReservationStatusResponse,
  PublicRegisterContributionRequest,
  PublicRegisterContributionResponse,
  PublicContributeWithPixRequest,
  PublicContributeWithPixResponse,
  PublicContributionStatusResponse,
  PublicStoreData,
  PublicStoreOrderRequest,
  PublicStoreOrderResponse,
  PublicStoreMembersData,
  PublicEventItem,
  PublicRaffleListItem,
  PublicCampaignListItem,
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

  publicListEvents: (data: { houseSlug: string }) =>
    callFunction<{ houseSlug: string }, PublicEventItem[]>('publicListEvents', data),

  publicListRaffles: (data: { houseSlug: string }) =>
    callFunction<{ houseSlug: string }, PublicRaffleListItem[]>('publicListRaffles', data),

  publicListCampaigns: (data: { houseSlug: string }) =>
    callFunction<{ houseSlug: string }, PublicCampaignListItem[]>('publicListCampaigns', data),

  publicReserveRaffleWithPix: (data: PublicReserveRaffleWithPixRequest) =>
    callFunction<PublicReserveRaffleWithPixRequest, PublicReserveRaffleWithPixResponse>('publicReserveRaffleWithPix', data),

  publicGetReservationStatus: (data: { reservationId: string }) =>
    callFunction<{ reservationId: string }, PublicReservationStatusResponse>('publicGetReservationStatus', data),

  publicContributeWithPix: (data: PublicContributeWithPixRequest) =>
    callFunction<PublicContributeWithPixRequest, PublicContributeWithPixResponse>('publicContributeWithPix', data),

  publicGetContributionStatus: (data: { contributionId: string }) =>
    callFunction<{ contributionId: string }, PublicContributionStatusResponse>('publicGetContributionStatus', data),
}
