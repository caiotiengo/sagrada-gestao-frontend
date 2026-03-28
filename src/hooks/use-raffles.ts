'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { rafflesService } from '@/services/raffles'
import type {
  CreateRaffleRequest,
  UpdateRaffleRequest,
  ReserveRaffleNumbersRequest,
  ConfirmRafflePaymentRequest,
  DrawRaffleRequest,
  DeleteRaffleRequest,
  DeleteRaffleReservationRequest,
  RaffleStatus,
} from '@/types'
import { toast } from 'sonner'

export function useRaffles(page = 1, status?: RaffleStatus) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['raffles', houseId, page, status],
    queryFn: () =>
      rafflesService.listRaffles({
        houseId: houseId!,
        page,
        limit: 20,
        status,
      }),
    enabled: !!houseId,
  })
}

export function useRaffleDetails(raffleId: string) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['raffle-details', houseId, raffleId],
    queryFn: () =>
      rafflesService.getRaffleDetails({
        houseId: houseId!,
        raffleId,
      }),
    enabled: !!houseId && !!raffleId,
  })
}

export function useCreateRaffle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRaffleRequest) =>
      rafflesService.createRaffle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] })
      toast.success('Rifa criada')
    },
    onError: () => {
      toast.error('Erro ao criar rifa')
    },
  })
}

export function useUpdateRaffle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateRaffleRequest) =>
      rafflesService.updateRaffle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] })
      queryClient.invalidateQueries({ queryKey: ['raffle-details'] })
      toast.success('Rifa atualizada')
    },
    onError: () => {
      toast.error('Erro ao atualizar rifa')
    },
  })
}

export function useReserveRaffleNumbers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReserveRaffleNumbersRequest) =>
      rafflesService.reserveRaffleNumbers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] })
      queryClient.invalidateQueries({ queryKey: ['raffle-details'] })
      toast.success('Números reservados')
    },
    onError: () => {
      toast.error('Erro ao reservar números')
    },
  })
}

export function useRaffleReservations(raffleId: string, page = 1, isPaid?: boolean) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['raffle-reservations', houseId, raffleId, page, isPaid],
    queryFn: () =>
      rafflesService.listRaffleReservations({
        houseId: houseId!,
        raffleId,
        page,
        limit: 20,
        isPaid,
      }),
    enabled: !!houseId && !!raffleId,
  })
}

export function useConfirmRafflePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConfirmRafflePaymentRequest) =>
      rafflesService.confirmRafflePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] })
      queryClient.invalidateQueries({ queryKey: ['raffle-details'] })
      queryClient.invalidateQueries({ queryKey: ['raffle-reservations'] })
      toast.success('Pagamento confirmado')
    },
    onError: () => {
      toast.error('Erro ao confirmar pagamento')
    },
  })
}

export function useDrawRaffle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DrawRaffleRequest) =>
      rafflesService.drawRaffle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] })
      queryClient.invalidateQueries({ queryKey: ['raffle-details'] })
      toast.success('Sorteio realizado')
    },
    onError: () => {
      toast.error('Erro ao realizar sorteio')
    },
  })
}

export function useDeleteRaffle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteRaffleRequest) =>
      rafflesService.deleteRaffle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] })
      toast.success('Rifa cancelada')
    },
    onError: () => {
      toast.error('Erro ao cancelar rifa')
    },
  })
}

export function useDeleteRaffleReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DeleteRaffleReservationRequest) => rafflesService.deleteRaffleReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffle-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['raffles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Reserva excluída com sucesso')
    },
    onError: () => {
      toast.error('Erro ao excluir reserva')
    },
  })
}
