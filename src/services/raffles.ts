import { callFunction } from '@/lib/callable'
import type {
  CreateRaffleRequest,
  RaffleItem,
  UpdateRaffleRequest,
  ListRafflesRequest,
  RaffleDetails,
  ReserveRaffleNumbersRequest,
  ReserveRaffleNumbersResponse,
  ListRaffleReservationsRequest,
  RaffleReservationItem,
  ConfirmRafflePaymentRequest,
  DrawRaffleRequest,
  DrawRaffleResponse,
  DeleteRaffleRequest,
  PaginatedResponse,
} from '@/types'

export const rafflesService = {
  createRaffle: (data: CreateRaffleRequest) =>
    callFunction<CreateRaffleRequest, RaffleItem>('createRaffle', data),

  updateRaffle: (data: UpdateRaffleRequest) =>
    callFunction<UpdateRaffleRequest, RaffleItem>('updateRaffle', data),

  listRaffles: (data: ListRafflesRequest) =>
    callFunction<ListRafflesRequest, PaginatedResponse<RaffleItem>>('listRaffles', data),

  getRaffleDetails: (data: { houseId: string; raffleId: string }) =>
    callFunction<{ houseId: string; raffleId: string }, RaffleDetails>('getRaffleDetails', data),

  reserveRaffleNumbers: (data: ReserveRaffleNumbersRequest) =>
    callFunction<ReserveRaffleNumbersRequest, ReserveRaffleNumbersResponse>('reserveRaffleNumbers', data),

  listRaffleReservations: (data: ListRaffleReservationsRequest) =>
    callFunction<ListRaffleReservationsRequest, PaginatedResponse<RaffleReservationItem>>('listRaffleReservations', data),

  confirmRafflePayment: (data: ConfirmRafflePaymentRequest) =>
    callFunction<ConfirmRafflePaymentRequest, { message: string }>('confirmRafflePayment', data),

  drawRaffle: (data: DrawRaffleRequest) =>
    callFunction<DrawRaffleRequest, DrawRaffleResponse>('drawRaffle', data),

  deleteRaffle: (data: DeleteRaffleRequest) =>
    callFunction<DeleteRaffleRequest, { message: string }>('deleteRaffle', data),
}
