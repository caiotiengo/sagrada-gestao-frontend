import { callFunction } from '@/lib/callable'
import type {
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  DeleteShoppingListRequest,
  ArchiveShoppingListRequest,
  ShoppingListItem,
  ListShoppingListsRequest,
  ListShoppingItemsRequest,
  AddShoppingItemRequest,
  ShoppingItem,
  ToggleShoppingItemRequest,
  CompleteShoppingListRequest,
  SignUpForListRequest,
  ConfirmListPaymentRequest,
  PaginatedResponse,
} from '@/types'

export const shoppingService = {
  createShoppingList: (data: CreateShoppingListRequest) =>
    callFunction<CreateShoppingListRequest, ShoppingListItem>('createShoppingList', data),

  updateShoppingList: (data: UpdateShoppingListRequest) =>
    callFunction<UpdateShoppingListRequest, ShoppingListItem>('updateShoppingList', data),

  deleteShoppingList: (data: DeleteShoppingListRequest) =>
    callFunction<DeleteShoppingListRequest, { deleted: true }>('deleteShoppingList', data),

  archiveShoppingList: (data: ArchiveShoppingListRequest) =>
    callFunction<ArchiveShoppingListRequest, ShoppingListItem>('archiveShoppingList', data),

  listShoppingLists: (data: ListShoppingListsRequest) =>
    callFunction<ListShoppingListsRequest, PaginatedResponse<ShoppingListItem>>('listShoppingLists', data),

  listShoppingItems: (data: ListShoppingItemsRequest) =>
    callFunction<ListShoppingItemsRequest, ShoppingItem[]>('listShoppingItems', data),

  addShoppingItem: (data: AddShoppingItemRequest) =>
    callFunction<AddShoppingItemRequest, ShoppingItem>('addShoppingItem', data),

  toggleShoppingItem: (data: ToggleShoppingItemRequest) =>
    callFunction<ToggleShoppingItemRequest, ShoppingItem>('toggleShoppingItem', data),

  completeShoppingList: (data: CompleteShoppingListRequest) =>
    callFunction<CompleteShoppingListRequest, ShoppingListItem>('completeShoppingList', data),

  signUpForList: (data: SignUpForListRequest) =>
    callFunction<SignUpForListRequest, { itemId: string; memberName: string; listId: string }>('signUpForList', data),

  confirmListPayment: (data: ConfirmListPaymentRequest) =>
    callFunction<ConfirmListPaymentRequest, ShoppingItem>('confirmListPayment', data),
}
