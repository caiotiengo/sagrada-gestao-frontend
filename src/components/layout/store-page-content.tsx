'use client'

import { useState, useMemo } from 'react'
import {
  Package,
  Plus,
  Minus,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  BarChart3,
  Globe,
  Share2,
  MoreVertical,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import {
  useStoreItems,
  useCreateStoreItem,
  useDeleteStoreItem,
  useDeleteSale,
  useRegisterSale,
  useSales,
  useUpdateSaleStatus,
  useSalesSummary,
} from '@/hooks/use-store'
import { useAllMembers } from '@/hooks/use-members'
import { PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, SALE_STATUS_VARIANTS, ROUTES } from '@/constants'
import type { StoreItem, PaymentMethod, SaleStatus, StoreCategory } from '@/types'
import { formatCurrency, formatDate } from '@/utils'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/forms/currency-input'
import { DateInput } from '@/components/forms/date-input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'card', label: 'Cartão' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'other', label: 'Outro' },
]

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type SalesFilterKey = 'all' | 'paid' | 'pending' | 'tab' | 'public'

const LABELS: Record<StoreCategory, { title: string; subtitle: string; itemLabel: string; emptyTitle: string; emptyDesc: string }> = {
  store: {
    title: 'Loja',
    subtitle: 'Gerencie os itens da loja e registre vendas',
    itemLabel: 'item à loja',
    emptyTitle: 'Nenhum item cadastrado',
    emptyDesc: 'Crie um item para começar a gerenciar sua loja.',
  },
  canteen: {
    title: 'Cantina',
    subtitle: 'Gerencie os itens da cantina e registre vendas',
    itemLabel: 'item à cantina',
    emptyTitle: 'Nenhum item cadastrado',
    emptyDesc: 'Crie um item para começar a gerenciar sua cantina.',
  },
}

interface StorePageContentProps {
  category: StoreCategory
}

export function StorePageContent({ category }: StorePageContentProps) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const houseSlug = useAuthStore((s) => s.currentHouse?.houseSlug)
  const canManage = useAuthStore((s) => s.hasPermission('canRegisterSales'))
  const labels = LABELS[category]

  const [itemPage, setItemPage] = useState(1)
  const { data: itemsData, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems } = useStoreItems(itemPage, category)

  const items = itemsData?.data ?? []
  const itemTotalPages = itemsData?.pagination.totalPages ?? 1

  const [itemSearch, setItemSearch] = useState('')

  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items
    const query = itemSearch.toLowerCase()
    return items.filter((i) => i.name.toLowerCase().includes(query))
  }, [items, itemSearch])

  // Create item dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPrice, setNewPrice] = useState(0)
  const [newStock, setNewStock] = useState('')
  const createMutation = useCreateStoreItem()
  const deleteMutation = useDeleteStoreItem()
  const deleteSaleMutation = useDeleteSale()
  const [deleteSaleAlertId, setDeleteSaleAlertId] = useState<string | null>(null)

  const handleDeleteItem = (itemId: string) => {
    if (!houseId) return
    deleteMutation.mutate({ houseId, itemId })
  }

  const handleCreateItem = () => {
    if (!houseId || !newName.trim() || !newPrice) return
    createMutation.mutate(
      {
        houseId,
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        price: newPrice,
        stock: newStock ? Number(newStock) : undefined,
        category,
      },
      {
        onSuccess: () => {
          setCreateOpen(false)
          setNewName('')
          setNewDescription('')
          setNewPrice(0)
          setNewStock('')
        },
      },
    )
  }

  // Sale cart
  const [cart, setCart] = useState<Array<{ item: StoreItem; quantity: number }>>([])
  const [saleOpen, setSaleOpen] = useState(false)
  const [saleBuyerName, setSaleBuyerName] = useState('')
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('pix')
  const [saleIsPaid, setSaleIsPaid] = useState(true)
  const [saleSubmitting, setSaleSubmitting] = useState(false)
  const saleMutation = useRegisterSale()

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)
  const cartQty = (itemId: string) => cart.find((c) => c.item.id === itemId)?.quantity ?? 0

  const addToCart = (item: StoreItem) => {
    if (!item.isActive || item.stock <= 0) return
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id)
      if (existing) {
        if (existing.quantity >= item.stock) return prev
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const incCart = (itemId: string) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.item.id !== itemId) return c
        if (c.quantity >= c.item.stock) return c
        return { ...c, quantity: c.quantity + 1 }
      }),
    )
  }

  const decCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0),
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId))
  }

  const openCheckout = () => {
    if (cart.length === 0) return
    setSaleBuyerName('')
    setSalePaymentMethod('pix')
    setSaleIsPaid(true)
    setSaleOpen(true)
  }

  const handleRegisterSale = async () => {
    if (!houseId || cart.length === 0) return
    setSaleSubmitting(true)
    try {
      for (const c of cart) {
        await saleMutation.mutateAsync({
          houseId,
          itemId: c.item.id,
          quantity: c.quantity,
          buyerName: saleBuyerName.trim() || undefined,
          paymentMethod: salePaymentMethod,
          isPaid: saleIsPaid,
        })
      }
      setCart([])
      setSaleOpen(false)
    } finally {
      setSaleSubmitting(false)
    }
  }

  // Sales tab state
  const [salesPage, setSalesPage] = useState(1)
  const [salesFilter, setSalesFilter] = useState<SalesFilterKey>('all')
  const [salesDate, setSalesDate] = useState(todayString())

  const salesStatusFilter: SaleStatus | undefined =
    salesFilter === 'paid' || salesFilter === 'tab' || salesFilter === 'pending'
      ? salesFilter
      : undefined
  const salesSourceFilter: 'public' | undefined =
    salesFilter === 'public' ? 'public' : undefined

  const { data: salesData, isLoading: salesLoading } = useSales(
    salesPage,
    undefined,
    undefined,
    salesDate || undefined,
    salesDate || undefined,
    salesStatusFilter,
    salesSourceFilter,
    category,
  )

  const allSales = salesData?.data ?? []
  const salesTotalPages = salesData?.pagination.totalPages ?? 1
  const salesLimit = salesData?.pagination.limit ?? 10

  const [salesSearch, setSalesSearch] = useState('')

  const sales = useMemo(() => {
    if (!salesSearch.trim()) return allSales
    const query = salesSearch.toLowerCase()
    return allSales.filter((s) =>
      (s.buyerName && s.buyerName.toLowerCase().includes(query)) ||
      (s.itemName && s.itemName.toLowerCase().includes(query)),
    )
  }, [allSales, salesSearch])

  // Summary
  const { data: summary } = useSalesSummary(salesDate || todayString(), category)

  // Update sale status dialog
  const updateStatusMutation = useUpdateSaleStatus()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusSaleId, setStatusSaleId] = useState('')
  const [statusValue, setStatusValue] = useState<SaleStatus>('paid')
  const [statusPayMethod, setStatusPayMethod] = useState<PaymentMethod>('pix')
  const [statusMemberId, setStatusMemberId] = useState('')

  const { data: membersData } = useAllMembers()
  const members = membersData?.data ?? []

  const handleUpdateStatus = () => {
    if (!houseId || !statusSaleId) return
    updateStatusMutation.mutate(
      {
        houseId,
        saleId: statusSaleId,
        status: statusValue,
        paymentMethod: statusValue === 'paid' ? statusPayMethod : undefined,
        memberId: statusValue === 'tab' ? statusMemberId || undefined : undefined,
      },
      {
        onSuccess: () => {
          setStatusDialogOpen(false)
          setStatusSaleId('')
        },
      },
    )
  }

  const openStatusDialog = (saleId: string, currentStatus: SaleStatus) => {
    setStatusSaleId(saleId)
    setStatusValue(currentStatus === 'paid' ? 'paid' : 'paid')
    setStatusPayMethod('pix')
    setStatusMemberId('')
    setStatusDialogOpen(true)
  }

  if (itemsError) {
    return (
      <ErrorState
        title="Erro ao carregar itens"
        message={`Não foi possível carregar a lista de itens da ${labels.title.toLowerCase()}. Tente novamente.`}
        onRetry={() => refetchItems()}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{labels.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {houseSlug && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const link = `${window.location.origin}${ROUTES.PUBLIC_STORE(houseSlug)}`
                navigator.clipboard.writeText(link)
                toast.success('Link copiado!')
              }}
            >
              <Share2 className="size-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
          )}

        {canManage && <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-1 size-4" />
            Novo Item
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Item</DialogTitle>
              <DialogDescription>Adicione um novo {labels.itemLabel}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="Nome do item" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Descrição (opcional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              <CurrencyInput placeholder="Preço (R$ 0,00)" value={newPrice} onValueChange={setNewPrice} />
              <Input type="number" placeholder="Estoque inicial (opcional)" min={0} value={newStock} onChange={(e) => setNewStock(e.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={handleCreateItem} disabled={!newName.trim() || !newPrice || createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}
        </div>
      </div>

      {/* Tabs: Items / Sales */}
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items">
          {/* Item Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar item..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {itemsLoading ? (
            <ListSkeleton rows={6} />
          ) : filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const qty = cartQty(item.id)
                const remaining = item.stock - qty
                const canAdd = item.isActive && item.stock > 0 && remaining > 0
                return (
                  <Card key={item.id}>
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{item.name}</span>
                          <Badge variant={item.isActive ? 'default' : 'secondary'}>
                            {item.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{formatCurrency(item.price)}</span>
                          <span>Estoque: {remaining}/{item.stock}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {canManage && qty > 0 ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => decCart(item.id)}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              disabled={remaining <= 0}
                              onClick={() => incCart(item.id)}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          canManage && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              disabled={!canAdd}
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="size-3.5" />
                              {item.stock <= 0 ? 'Sem estoque' : 'Adicionar'}
                            </Button>
                          )
                        )}
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon" className="size-8" />}
                            >
                              <MoreVertical className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                disabled={deleteMutation.isPending}
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-4" />
                                Excluir item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {itemTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" disabled={itemPage <= 1} onClick={() => setItemPage((p) => Math.max(1, p - 1))}>
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">{itemPage} de {itemTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={itemPage >= itemTotalPages} onClick={() => setItemPage((p) => p + 1)}>
                    Próximo
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title={labels.emptyTitle}
              description={labels.emptyDesc}
              className="min-h-[30dvh]"
            />
          )}
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <div className="space-y-4">
            {/* Summary Card */}
            {summary && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <BarChart3 className="mx-auto mb-1 size-4 text-muted-foreground" />
                    <p className="text-lg font-bold">{summary.totalSales}</p>
                    <p className="text-xs text-muted-foreground">Vendas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <DollarSign className="mx-auto mb-1 size-4 text-muted-foreground" />
                    <p className="text-lg font-bold">{formatCurrency(summary.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle2 className="mx-auto mb-1 size-4 text-green-500" />
                    <p className="text-lg font-bold">{formatCurrency(summary.totalPaid)}</p>
                    <p className="text-xs text-muted-foreground">Pago ({summary.paidCount})</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Clock className="mx-auto mb-1 size-4 text-amber-500" />
                    <p className="text-lg font-bold">{formatCurrency(summary.totalPending)}</p>
                    <p className="text-xs text-muted-foreground">Pendente ({summary.pendingCount})</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <DateInput
                value={salesDate}
                onValueChange={(v) => { setSalesDate(v); setSalesPage(1) }}
                className="w-auto"
              />
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar comprador ou item..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {([
                  ['all', 'Todas'],
                  ['paid', 'Pagas'],
                  ['pending', 'Pendentes'],
                  ['tab', 'Na conta'],
                  ['public', 'Link público'],
                ] as const).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={salesFilter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setSalesFilter(key); setSalesPage(1) }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sales List */}
            {salesLoading ? (
              <ListSkeleton rows={5} />
            ) : sales.length > 0 ? (
              <div className="space-y-2">
                {sales.map((sale, index) => {
                  const saleNumber = (salesPage - 1) * salesLimit + index + 1
                  return (
                  <Card key={sale.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 flex-col items-center justify-center rounded-lg bg-muted sm:size-10">
                          {sale.orderNumber ? (
                            <span className="text-[0.6rem] font-bold text-primary sm:text-xs" title={sale.orderNumber}>
                              #{sale.orderNumber.split('-').pop()}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground sm:text-lg">
                              {saleNumber}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{sale.itemName ?? 'Item'}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge variant={SALE_STATUS_VARIANTS[sale.status] ?? 'outline'} className="text-[0.625rem]">
                                  {SALE_STATUS_LABELS[sale.status] ?? sale.status}
                                </Badge>
                                {sale.paymentMethod && (
                                  <Badge variant="outline" className="text-[0.625rem]">
                                    {PAYMENT_METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                                  </Badge>
                                )}
                                {sale.source === 'public' && (
                                  <Badge variant="outline" className="gap-0.5 text-[0.625rem]">
                                    <Globe className="size-2.5" />
                                    Link
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {canManage && (
                              <div className="flex shrink-0 items-center gap-1">
                                {sale.status === 'pending' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 text-xs"
                                    disabled={updateStatusMutation.isPending}
                                    onClick={() => {
                                      if (!houseId) return
                                      updateStatusMutation.mutate({ houseId, saleId: sale.id, status: 'ready' })
                                    }}
                                  >
                                    <CheckCircle2 className="size-3" />
                                    Pronto
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={<Button variant="ghost" size="icon" className="size-8" />}
                                  >
                                    <MoreVertical className="size-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {sale.status !== 'paid' && (
                                      <DropdownMenuItem
                                        onClick={() => openStatusDialog(sale.id, sale.status)}
                                      >
                                        <DollarSign className="size-4" />
                                        Atualizar status
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => setDeleteSaleAlertId(sale.id)}
                                    >
                                      <Trash2 className="size-4" />
                                      Excluir venda
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            {sale.orderNumber && <span className="font-medium text-primary">#{sale.orderNumber}</span>}
                            <span>Qtd: {sale.quantity}</span>
                            <span className="font-medium">{formatCurrency(sale.totalPrice)}</span>
                            {sale.buyerName && <span>{sale.buyerName}</span>}
                            {sale.buyerPhone && <span>{sale.buyerPhone}</span>}
                            <span>{formatDate(sale.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  )
                })}

                {salesTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="outline" size="sm" disabled={salesPage <= 1} onClick={() => setSalesPage((p) => Math.max(1, p - 1))}>
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">{salesPage} de {salesTotalPages}</span>
                    <Button variant="outline" size="sm" disabled={salesPage >= salesTotalPages} onClick={() => setSalesPage((p) => p + 1)}>
                      Próximo
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title="Nenhuma venda encontrada"
                description="Não há vendas para os filtros selecionados."
                className="min-h-[20dvh]"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Sale AlertDialog */}
      <AlertDialog open={!!deleteSaleAlertId} onOpenChange={(open) => { if (!open) setDeleteSaleAlertId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir venda?</AlertDialogTitle>
            <AlertDialogDescription>
              A venda será excluída permanentemente e os valores serão revertidos nos saldos.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!houseId || !deleteSaleAlertId) return
                deleteSaleMutation.mutate(
                  { houseId, saleId: deleteSaleAlertId },
                  { onSuccess: () => setDeleteSaleAlertId(null) },
                )
              }}
              disabled={deleteSaleMutation.isPending}
            >
              {deleteSaleMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Checkout Dialog */}
      <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              {cart.length} {cart.length === 1 ? 'item' : 'itens'} no carrinho
            </DialogDescription>
          </DialogHeader>

          {/* Cart items */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            {cart.map((c) => (
              <div key={c.item.id} className="flex items-center gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.quantity}x {formatCurrency(c.item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-7" onClick={() => decCart(c.item.id)}>
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-6 text-center text-xs font-medium tabular-nums">{c.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    disabled={c.quantity >= c.item.stock}
                    onClick={() => incCart(c.item.id)}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <span className="w-20 text-right text-sm font-semibold tabular-nums">
                  {formatCurrency(c.item.price * c.quantity)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart(c.item.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome do comprador (opcional)</label>
              <Input
                placeholder="Nome do comprador"
                value={saleBuyerName}
                onChange={(e) => setSaleBuyerName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Método de pagamento</label>
              <select
                className={SELECT_CLASS}
                value={salePaymentMethod}
                onChange={(e) => setSalePaymentMethod(e.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="saleIsPaid"
                type="checkbox"
                checked={saleIsPaid}
                onChange={(e) => setSaleIsPaid(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <label htmlFor="saleIsPaid" className="text-sm">
                Pago no ato
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              onClick={handleRegisterSale}
              disabled={cart.length === 0 || saleSubmitting}
            >
              {saleSubmitting ? 'Registrando...' : `Registrar ${formatCurrency(cartTotal)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating cart bar */}
      {cartCount > 0 && !saleOpen && (
        <div className="fixed inset-x-0 bottom-16 z-40 px-4 pb-2 sm:bottom-0 sm:pb-4">
          <div className="mx-auto max-w-md">
            <Button size="lg" className="w-full gap-2 shadow-lg" onClick={openCheckout}>
              <ShoppingCart className="size-4" />
              Finalizar venda ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
              <span className="ml-auto font-semibold">{formatCurrency(cartTotal)}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Update Sale Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={(open) => { setStatusDialogOpen(open); if (!open) setStatusSaleId('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status da Venda</DialogTitle>
            <DialogDescription>Selecione o novo status para esta venda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                className={SELECT_CLASS}
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value as SaleStatus)}
              >
                <option value="paid">Pago</option>
                <option value="ready">Pronto para retirada</option>
                <option value="pending">Pendente</option>
                <option value="tab">Na conta</option>
                <option value="unpaid">Não pago</option>
              </select>
            </div>

            {statusValue === 'paid' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Método de pagamento</label>
                <select
                  className={SELECT_CLASS}
                  value={statusPayMethod}
                  onChange={(e) => setStatusPayMethod(e.target.value as PaymentMethod)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            )}

            {statusValue === 'tab' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Membro (na conta)</label>
                <select
                  className={SELECT_CLASS}
                  value={statusMemberId}
                  onChange={(e) => setStatusMemberId(e.target.value)}
                >
                  <option value="">Selecione um membro</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                updateStatusMutation.isPending ||
                (statusValue === 'tab' && !statusMemberId)
              }
            >
              {updateStatusMutation.isPending ? 'Atualizando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
