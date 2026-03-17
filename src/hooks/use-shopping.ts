'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { shoppingService } from '@/services/shopping'
import type {
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  DeleteShoppingListRequest,
  ArchiveShoppingListRequest,
  AddShoppingItemRequest,
  ToggleShoppingItemRequest,
  CompleteShoppingListRequest,
  SignUpForListRequest,
  AdminSignUpMemberRequest,
  ConfirmListPaymentRequest,
  ShoppingListType,
  ShoppingListStatus,
} from '@/types'
import { toast } from 'sonner'

export function useShoppingLists(
  page = 1,
  type?: ShoppingListType,
  status?: ShoppingListStatus,
  isCompleted?: boolean,
) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['shopping-lists', houseId, page, type, status, isCompleted],
    queryFn: () =>
      shoppingService.listShoppingLists({
        houseId: houseId!,
        page,
        limit: 20,
        type,
        status,
        isCompleted,
      }),
    enabled: !!houseId,
  })
}

export function useShoppingItems(listId: string | null) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['shopping-items', houseId, listId],
    queryFn: () =>
      shoppingService.listShoppingItems({
        houseId: houseId!,
        listId: listId!,
      }),
    enabled: !!houseId && !!listId,
  })
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateShoppingListRequest) =>
      shoppingService.createShoppingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Criado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar')
    },
  })
}

export function useUpdateShoppingList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateShoppingListRequest) =>
      shoppingService.updateShoppingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar')
    },
  })
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteShoppingListRequest) =>
      shoppingService.deleteShoppingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Excluído com sucesso')
    },
    onError: () => {
      toast.error('Erro ao excluir')
    },
  })
}

export function useArchiveShoppingList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ArchiveShoppingListRequest) =>
      shoppingService.archiveShoppingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Arquivado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao arquivar')
    },
  })
}

export function useAddShoppingItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddShoppingItemRequest) =>
      shoppingService.addShoppingItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
    },
    onError: () => {
      toast.error('Erro ao adicionar item')
    },
  })
}

export function useToggleShoppingItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ToggleShoppingItemRequest) =>
      shoppingService.toggleShoppingItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      queryClient.invalidateQueries({ queryKey: ['financial-statement'] })
      queryClient.invalidateQueries({ queryKey: ['member-financial-summary'] })
      queryClient.invalidateQueries({ queryKey: ['my-financial-summary'] })
    },
    onError: () => {
      toast.error('Erro ao atualizar item')
    },
  })
}

export function useCompleteShoppingList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompleteShoppingListRequest) =>
      shoppingService.completeShoppingList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Finalizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao finalizar')
    },
  })
}

export function useSignUpForList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SignUpForListRequest) =>
      shoppingService.signUpForList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Inscrição realizada!')
    },
    onError: () => {
      toast.error('Erro ao se inscrever')
    },
  })
}

export function useAdminSignUpMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminSignUpMemberRequest) =>
      shoppingService.adminSignUpMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Membro inscrito!')
    },
    onError: () => {
      toast.error('Erro ao inscrever membro')
    },
  })
}

export function useConfirmListPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConfirmListPaymentRequest) =>
      shoppingService.confirmListPayment(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      queryClient.invalidateQueries({ queryKey: ['financial-statement'] })
      queryClient.invalidateQueries({ queryKey: ['member-financial-summary'] })
      queryClient.invalidateQueries({ queryKey: ['my-financial-summary'] })
      toast.success(variables.isPaid === false ? 'Pagamento revertido' : 'Pagamento confirmado')
    },
    onError: () => {
      toast.error('Erro ao atualizar pagamento')
    },
  })
}
