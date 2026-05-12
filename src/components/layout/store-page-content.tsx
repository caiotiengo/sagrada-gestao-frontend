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
  useUpdateStoreItem,
  useDeleteStoreItem,
  useDeleteSale,
  useRegisterSaleBatch,
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
  const updateMutation = useUpdateStoreItem()
  const deleteMutation = useDeleteStoreItem()

  // Stock adjust dialog state
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [stockItem, setStockItem] = useState<StoreItem | null>(null)
  const [stockMode, setStockMode] = useState<'add' | 'set'>('add')
  const [stockValue, setStockValue] = useState('')

  const openStockDialog = (item: StoreItem) => {
    setStockItem(item)
    setStockMode('add')
    setStockValue('')
    setStockDialogOpen(true)
  }

  const handleSaveStock = () => {
    if (!houseId || !stockItem) return
    const n = Number(stockValue)
    if (!Number.isFinite(n) || n < 0) return
    const nextStock = stockMode === 'add' ? stockItem.stock + n : n
    updateMutation.mutate(
      { houseId, itemId: stockItem.id, stock: nextStock },
      {
        onSuccess: () => {
          setStockDialogOpen(false)
          setStockItem(null)
          setStockValue('')
        },
      },
    )
  }
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
  const [saleBuyerType, setSaleBuyerType] = useState<'member' | 'external'>('member')
  const [saleMemberId, setSaleMemberId] = useState('')
  const [saleBuyerName, setSaleBuyerName] = useState('')
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('pix')
  const [saleIsPaid, setSaleIsPaid] = useState(true)
  const [saleSubmitting, setSaleSubmitting] = useState(false)
  const saleBatchMutation = useRegisterSaleBatch()

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
    setSaleBuyerType('member')
    setSaleMemberId('')
    setSaleBuyerName('')
    setSalePaymentMethod('pix')
    setSaleIsPaid(true)
    setSaleOpen(true)
  }

  const handleRegisterSale = async () => {
    if (!houseId || cart.length === 0) return
    if (saleBuyerType === 'member' && !saleMemberId) return
    if (saleBuyerType === 'external' && !saleBuyerName.trim()) return
    setSaleSubmitting(true)
    try {
      const selectedMember = members.find((m) => m.id === saleMemberId)
      const buyerName =
        saleBuyerType === 'member' ? selectedMember?.fullName : saleBuyerName.trim()
      const memberId = saleBuyerType === 'member' ? saleMemberId : undefined
      await saleBatchMutation.mutateAsync({
        houseId,
        items: cart.map((c) => ({ itemId: c.item.id, quantity: c.quantity })),
        buyerName: buyerName || undefined,
        memberId,
        paymentMethod: salePaymentMethod,
        isPaid: saleIsPaid,
      })
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

  // Group sales by orderNumber so multi-item purchases appear as one card
  const groupedSales = useMemo(() => {
    const groups: Array<{
      orderNumber: string | null
      items: typeof sales
      buyerName: string | null
      status: string
      paymentMethod: string | null
      source: string
      totalPrice: number
      totalQty: number
      createdAt: string | null
    }> = []
    const byOrder = new Map<string, number>()
    for (const sale of sales) {
      const key = sale.orderNumber || `__solo_${sale.id}`
      const existingIdx = byOrder.get(key)
      if (existingIdx === undefined) {
        byOrder.set(key, groups.length)
        groups.push({
          orderNumber: sale.orderNumber ?? null,
          items: [sale],
          buyerName: sale.buyerName ?? null,
          status: sale.status,
          paymentMethod: sale.paymentMethod ?? null,
          source: sale.source ?? 'internal',
          totalPrice: sale.totalPrice,
          totalQty: sale.quantity,
          createdAt: sale.createdAt ?? null,
        })
      } else {
        const g = groups[existingIdx]
        g.items.push(sale)
        g.totalPrice += sale.totalPrice
        g.totalQty += sale.quantity
      }
    }
    return groups
  }, [sales])

  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const toggleOrderExpanded = (key: string) =>
    setExpandedOrders((p) => ({ ...p, [key]: !p[key] }))

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
                              <DropdownMenuItem onClick={() => openStockDialog(item)}>
                                <Package className="size-4" />
                                Ajustar estoque
                              </DropdownMenuItem>
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

            {/* Sales List (grouped by orderNumber) */}
            {salesLoading ? (
              <ListSkeleton rows={5} />
            ) : groupedSales.length > 0 ? (
              <div className="space-y-2">
                {groupedSales.map((group, gIdx) => {
                  const key = group.orderNumber || `solo-${group.items[0].id}`
                  const isExpanded = !!expandedOrders[key]
                  const fallbackNumber = (salesPage - 1) * salesLimit + gIdx + 1
                  const isMulti = group.items.length > 1
                  return (
                  <Card key={key}>
                    <CardContent className="p-3 sm:p-4">
                      <button
                        type="button"
                        onClick={() => isMulti && toggleOrderExpanded(key)}
                        className={`flex w-full items-start gap-3 text-left ${isMulti ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
                          {group.orderNumber ? (
                            <span className="text-[0.6rem] font-bold text-primary sm:text-xs" title={group.orderNumber}>
                              #{group.orderNumber.split('-').pop()}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">{fallbackNumber}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {group.buyerName ?? 'Sem comprador'}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge variant={SALE_STATUS_VARIANTS[group.status as SaleStatus] ?? 'outline'} className="text-[0.625rem]">
                                  {SALE_STATUS_LABELS[group.status as SaleStatus] ?? group.status}
                                </Badge>
                                {group.paymentMethod && (
                                  <Badge variant="outline" className="text-[0.625rem]">
                                    {PAYMENT_METHOD_LABELS[group.paymentMethod as PaymentMethod] ?? group.paymentMethod}
                                  </Badge>
                                )}
                                {group.source === 'public' && (
                                  <Badge variant="outline" className="gap-0.5 text-[0.625rem]">
                                    <Globe className="size-2.5" />
                                    Link
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-[0.625rem]">
                                  {group.items.length} {group.items.length === 1 ? 'item' : 'itens'} · {group.totalQty} un.
                                </Badge>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                              <span className="text-sm font-semibold tabular-nums">{formatCurrency(group.totalPrice)}</span>
                              {group.createdAt && (
                                <span className="text-[0.65rem] text-muted-foreground">{formatDate(group.createdAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Items: always show if single; expandable if multi */}
                      {(!isMulti || isExpanded) && (
                        <ul className="mt-3 space-y-1.5 border-t pt-3">
                          {group.items.map((sale) => (
                            <li key={sale.id} className="flex items-center gap-2 text-sm">
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{sale.itemName ?? 'Item'}</p>
                                <p className="text-[0.65rem] text-muted-foreground">
                                  {sale.quantity}x {formatCurrency(sale.unitPrice)}
                                </p>
                              </div>
                              <span className="w-20 text-right text-sm font-semibold tabular-nums">{formatCurrency(sale.totalPrice)}</span>
                              {canManage && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-7" />}>
                                    <MoreVertical className="size-3.5" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {sale.status !== 'paid' && (
                                      <DropdownMenuItem onClick={() => openStatusDialog(sale.id, sale.status)}>
                                        <DollarSign className="size-4" />
                                        Atualizar status
                                      </DropdownMenuItem>
                                    )}
                                    {sale.status === 'pending' && (
                                      <DropdownMenuItem
                                        disabled={updateStatusMutation.isPending}
                                        onClick={() => {
                                          if (!houseId) return
                                          updateStatusMutation.mutate({ houseId, saleId: sale.id, status: 'ready' })
                                        }}
                                      >
                                        <CheckCircle2 className="size-4" />
                                        Marcar pronto
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteSaleAlertId(sale.id)}>
                                      <Trash2 className="size-4" />
                                      Excluir item
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
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

      {/* Stock adjust Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={(open) => { setStockDialogOpen(open); if (!open) { setStockItem(null); setStockValue('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar estoque</DialogTitle>
            <DialogDescription>
              {stockItem ? `${stockItem.name} — Estoque atual: ${stockItem.stock}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-1 rounded-md bg-muted p-1">
              <button
                type="button"
                className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  stockMode === 'add'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setStockMode('add')}
              >
                Adicionar
              </button>
              <button
                type="button"
                className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  stockMode === 'set'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setStockMode('set')}
              >
                Definir total
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {stockMode === 'add' ? 'Quantidade a adicionar' : 'Novo estoque total'}
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
              />
            </div>
            {stockItem && stockValue && Number(stockValue) >= 0 && (
              <p className="text-sm text-muted-foreground">
                Estoque resultante:{' '}
                <span className="font-semibold text-foreground">
                  {stockMode === 'add' ? stockItem.stock + Number(stockValue) : Number(stockValue)}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              onClick={handleSaveStock}
              disabled={!stockValue || Number(stockValue) < 0 || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
        <DialogContent className="max-h-[90dvh] overflow-hidden p-0 sm:max-w-md">
          {/* Header with total */}
          <div className="bg-gradient-to-br from-primary to-primary/80 px-5 py-4 text-primary-foreground">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
              Total da venda
            </p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight">{formatCurrency(cartTotal)}</p>
            <p className="mt-0.5 text-xs text-primary-foreground/80">
              {cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho
            </p>
          </div>

          <div className="max-h-[calc(90dvh-7rem)] space-y-5 overflow-y-auto px-5 py-4">
            {/* Cart items */}
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Itens
              </p>
              <div className="divide-y rounded-lg border">
                {cart.map((c) => (
                  <div key={c.item.id} className="flex items-center gap-2 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(c.item.price)} cada
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-md border bg-muted/30 p-0.5">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => decCart(c.item.id)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-semibold tabular-nums">{c.quantity}</span>
                      <Button
                        variant="ghost"
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
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(c.item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Buyer */}
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Comprador
              </p>
              <div className="flex gap-1 rounded-md bg-muted p-1">
                <button
                  type="button"
                  className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    saleBuyerType === 'member'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => { setSaleBuyerType('member'); setSaleBuyerName('') }}
                >
                  Filho de Santo
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    saleBuyerType === 'external'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => { setSaleBuyerType('external'); setSaleMemberId('') }}
                >
                  Pessoa de fora
                </button>
              </div>
              {saleBuyerType === 'member' ? (
                <select
                  className={SELECT_CLASS}
                  value={saleMemberId}
                  onChange={(e) => setSaleMemberId(e.target.value)}
                >
                  <option value="">Selecione um filho de santo</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Nome da pessoa"
                  value={saleBuyerName}
                  onChange={(e) => setSaleBuyerName(e.target.value)}
                />
              )}
            </section>

            {/* Payment */}
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pagamento
              </p>
              <select
                className={SELECT_CLASS}
                value={salePaymentMethod}
                onChange={(e) => setSalePaymentMethod(e.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <label
                htmlFor="saleIsPaid"
                className="flex cursor-pointer items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
              >
                <input
                  id="saleIsPaid"
                  type="checkbox"
                  checked={saleIsPaid}
                  onChange={(e) => setSaleIsPaid(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <span className="text-sm">
                  Pago no ato
                  {saleBuyerType === 'member' && !saleIsPaid && (
                    <span className="ml-1 text-xs text-muted-foreground">(fica como fiado)</span>
                  )}
                </span>
              </label>
            </section>
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t bg-background px-5 py-3">
            <DialogClose render={<Button variant="outline" className="flex-1 sm:flex-none" />}>
              Cancelar
            </DialogClose>
            <Button
              className="flex-1"
              onClick={handleRegisterSale}
              disabled={
                cart.length === 0 ||
                saleSubmitting ||
                (saleBuyerType === 'member' && !saleMemberId) ||
                (saleBuyerType === 'external' && !saleBuyerName.trim())
              }
            >
              {saleSubmitting ? 'Registrando...' : 'Registrar venda'}
            </Button>
          </div>
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
