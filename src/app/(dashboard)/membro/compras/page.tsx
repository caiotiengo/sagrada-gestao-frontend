'use client'

import { useState } from 'react'
import {
  useShoppingLists,
  useShoppingItems,
  useCreateShoppingList,
  useAddShoppingItem,
  useToggleShoppingItem,
  useCompleteShoppingList,
} from '@/hooks/use-shopping'
import { useAuthStore } from '@/stores/auth'
import type { ShoppingListItem, ShoppingItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LoadingState } from '@/components/feedback/loading-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { ShoppingCart, Plus, Check, ChevronDown, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export default function MemberShoppingPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const { data, isLoading, isError, refetch } = useShoppingLists(1, 'list', 'active')
  const createList = useCreateShoppingList()
  const completeList = useCompleteShoppingList()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expandedListId, setExpandedListId] = useState<string | null>(null)

  const lists = data?.data ?? []

  function handleCreateList(e: React.FormEvent) {
    e.preventDefault()
    if (!houseId || !title.trim()) return

    createList.mutate(
      { houseId, title: title.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setDialogOpen(false)
        },
      },
    )
  }

  function handleCompleteList(listId: string) {
    if (!houseId) return
    completeList.mutate({ houseId, listId })
  }

  if (isLoading) return <LoadingState message="Carregando listas de compras..." />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Compras</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-1.5 size-4" />
            Nova lista
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova lista de compras</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateList} className="space-y-4">
              <Input
                placeholder="Título da lista"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createList.isPending || !title.trim()}
              >
                {createList.isPending ? 'Criando...' : 'Criar lista'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma lista de compras"
          description="Crie uma nova lista para começar a organizar suas compras."
        />
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              isExpanded={expandedListId === list.id}
              onToggleExpand={() =>
                setExpandedListId(expandedListId === list.id ? null : list.id)
              }
              onComplete={() => handleCompleteList(list.id)}
              isCompleting={completeList.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ShoppingListCard({
  list,
  isExpanded,
  onToggleExpand,
  onComplete,
  isCompleting,
}: {
  list: ShoppingListItem
  isExpanded: boolean
  onToggleExpand: () => void
  onComplete: () => void
  isCompleting: boolean
}) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const { data: items, isLoading: itemsLoading } = useShoppingItems(
    isExpanded ? list.id : null,
  )
  const addItem = useAddShoppingItem()
  const toggleItem = useToggleShoppingItem()

  const [newItemName, setNewItemName] = useState('')

  const shoppingItems: ShoppingItem[] = items ?? []
  const purchasedCount = shoppingItems.filter((i) => i.isPurchased).length
  const totalCount = shoppingItems.length

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!houseId || !newItemName.trim()) return

    addItem.mutate(
      { houseId, listId: list.id, name: newItemName.trim() },
      { onSuccess: () => setNewItemName('') },
    )
  }

  function handleToggleItem(item: ShoppingItem) {
    if (!houseId) return
    toggleItem.mutate({
      houseId,
      itemId: item.id,
      isPurchased: !item.isPurchased,
    })
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-0">
        {/* Header - always visible, clickable to expand */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex w-full items-center justify-between gap-3 p-4 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{list.title}</h3>
              <Badge
                variant={list.isCompleted ? 'default' : 'secondary'}
                className={
                  list.isCompleted
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                }
              >
                {list.isCompleted ? 'Finalizada' : 'Em andamento'}
              </Badge>
            </div>
            {list.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {list.description}
              </p>
            )}
            {isExpanded && totalCount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {purchasedCount} de {totalCount} itens comprados
              </p>
            )}
          </div>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-border/50 px-4 pb-4 pt-3">
            {itemsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Items list */}
                {shoppingItems.length > 0 ? (
                  <ul className="space-y-1">
                    {shoppingItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
                        <Checkbox
                          checked={item.isPurchased}
                          onCheckedChange={() => handleToggleItem(item)}
                          disabled={list.isCompleted}
                        />
                        <span
                          className={cn(
                            'flex-1 text-sm',
                            item.isPurchased && 'text-muted-foreground line-through',
                          )}
                        >
                          {item.name}
                          {item.quantity && item.quantity > 1 && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              x{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    Nenhum item adicionado ainda.
                  </p>
                )}

                {/* Add item form */}
                {!list.isCompleted && (
                  <form
                    onSubmit={handleAddItem}
                    className="mt-3 flex items-center gap-2"
                  >
                    <Input
                      placeholder="Adicionar item..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      disabled={addItem.isPending || !newItemName.trim()}
                      className="shrink-0"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </form>
                )}

                {/* Complete button */}
                {!list.isCompleted && shoppingItems.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onComplete}
                    disabled={isCompleting}
                    className="mt-3 w-full"
                  >
                    <Check className="mr-1.5 size-3.5" />
                    Finalizar lista
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
