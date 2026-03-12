'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Store,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Loader2,
  CreditCard,
  Receipt,
  CheckCircle2,
  ClipboardList,
  Package,
} from 'lucide-react'
import { useStoreItems, useRegisterSale, useMemberSales } from '@/hooks/use-store'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate } from '@/utils'
import { PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, SALE_STATUS_VARIANTS } from '@/constants'
import type { StoreItem, PaymentMethod, SaleItem } from '@/types'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CartItem {
  item: StoreItem
  quantity: number
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'card', label: 'Cartão' },
  { value: 'transfer', label: 'Transferência' },
]

export default function MemberStorePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Cantina
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Faça seus pedidos e acompanhe o histórico
        </p>
      </div>

      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store">
            <Store className="mr-1.5 size-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ClipboardList className="mr-1.5 size-4" />
            Meus Pedidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <StoreTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ========================
// Store Tab (buy items)
// ========================

function StoreTab() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const profile = useAuthStore((s) => s.profile)
  const currentHouse = useAuthStore((s) => s.currentHouse)
  const canRegisterSales = useAuthStore((s) => s.hasPermission('canRegisterSales'))

  const { data, isLoading, isError, refetch } = useStoreItems(1, 'canteen')
  const registerSale = useRegisterSale()

  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderMode, setOrderMode] = useState<'pay' | 'tab' | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix')
  const [orderSuccess, setOrderSuccess] = useState(false)

  const items = (data?.data ?? []).filter((i) => i.isActive && i.stock > 0)

  const addToCart = (item: StoreItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id)
      if (existing) {
        if (existing.quantity >= item.stock) return prev
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  const handleCheckout = async () => {
    if (!houseId || !currentHouse || cart.length === 0) return

    const mode = canRegisterSales ? orderMode : 'tab'
    if (!mode) return

    const memberId = currentHouse.memberId

    for (const cartItem of cart) {
      await registerSale.mutateAsync({
        houseId,
        itemId: cartItem.item.id,
        quantity: cartItem.quantity,
        memberId,
        buyerName: profile?.fullName,
        isPaid: mode === 'pay',
        paymentMethod: mode === 'pay' ? selectedPayment : undefined,
      })
    }

    setCart([])
    setCheckoutOpen(false)
    setOrderMode(null)
    setOrderSuccess(true)
  }

  if (isLoading) return <LoadingState message="Carregando cantina..." />
  if (isError) return <ErrorState onRetry={refetch} />

  if (orderSuccess) {
    return (
      <div className="px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-12 text-emerald-500" />
        <h2 className="text-2xl font-bold">Pedido realizado!</h2>
        <p className="mt-2 text-muted-foreground">
          Seu pedido foi registrado com sucesso.
        </p>
        <Button className="mt-6" onClick={() => setOrderSuccess(false)}>
          Fazer outro pedido
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cart button */}
      {cartCount > 0 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setCheckoutOpen(true)}
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Carrinho</span>
            <Badge variant="secondary" className="ml-1 bg-primary-foreground/20 text-primary-foreground">
              {cartCount}
            </Badge>
          </Button>
        </div>
      )}

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const inCart = cart.find((c) => c.item.id === item.id)
            return (
              <Card key={item.id}>
                <CardContent className="space-y-3 p-4">
                  {item.imageUrl && (
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.stock} disponível
                    </Badge>
                  </div>

                  {inCart ? (
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium tabular-nums">
                        {inCart.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={inCart.quantity >= item.stock}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="size-3.5" />
                      Adicionar
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Store}
          title="Nenhum produto disponível"
          description="Não há produtos disponíveis na cantina no momento."
        />
      )}

      {/* Floating Cart Bar (mobile) */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-40 px-4 pb-2 sm:bottom-0 sm:pb-4">
          <Button
            size="lg"
            className="w-full gap-2 shadow-lg"
            onClick={() => setCheckoutOpen(true)}
          >
            <ShoppingCart className="size-4" />
            Ver carrinho ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
            <span className="ml-auto font-semibold">{formatCurrency(cartTotal)}</span>
          </Button>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Seu Pedido
            </DialogTitle>
            <DialogDescription>
              Revise seus itens e escolha como deseja pagar
            </DialogDescription>
          </DialogHeader>

          {/* Cart Items */}
          <div className="space-y-3">
            {cart.map((cartItem) => (
              <div key={cartItem.item.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{cartItem.item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cartItem.quantity}x {formatCurrency(cartItem.item.price)}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(cartItem.item.price * cartItem.quantity)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart(cartItem.item.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>

          <Separator />

          {/* Payment Options */}
          {canRegisterSales ? (
            <>
              {!orderMode ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Como deseja registrar?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="flex h-auto flex-col items-center gap-2 py-4"
                      onClick={() => setOrderMode('pay')}
                    >
                      <CreditCard className="size-6 text-emerald-500" />
                      <span className="text-sm font-medium">Pagar agora</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex h-auto flex-col items-center gap-2 py-4"
                      onClick={() => setOrderMode('tab')}
                    >
                      <Receipt className="size-6 text-amber-500" />
                      <span className="text-sm font-medium">Colocar na conta</span>
                      <span className="text-[0.625rem] text-muted-foreground">Pagar depois</span>
                    </Button>
                  </div>
                </div>
              ) : orderMode === 'pay' ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Método de pagamento</p>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.value}
                        variant={selectedPayment === method.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPayment(method.value)}
                      >
                        {method.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Na conta
                  </p>
                  <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-200">
                    O valor de {formatCurrency(cartTotal)} será adicionado à sua conta para pagamento posterior.
                  </p>
                </div>
              )}

              {orderMode && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="ghost"
                    onClick={() => setOrderMode(null)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={registerSale.isPending}
                  >
                    {registerSale.isPending && <Loader2 className="size-4 animate-spin" />}
                    {registerSale.isPending
                      ? 'Registrando...'
                      : orderMode === 'pay'
                        ? `Pagar ${formatCurrency(cartTotal)}`
                        : `Colocar na conta ${formatCurrency(cartTotal)}`}
                  </Button>
                </DialogFooter>
              )}
            </>
          ) : (
            <>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Na conta
                </p>
                <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-200">
                  O valor de {formatCurrency(cartTotal)} será adicionado à sua conta.
                  O pagamento será feito ao responsável pela loja.
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleCheckout}
                  disabled={registerSale.isPending}
                  className="w-full"
                >
                  {registerSale.isPending && <Loader2 className="size-4 animate-spin" />}
                  {registerSale.isPending
                    ? 'Registrando...'
                    : `Colocar na conta ${formatCurrency(cartTotal)}`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ========================
// Orders Tab (my orders)
// ========================

function OrdersTab() {
  const memberId = useAuthStore((s) => s.currentHouse?.memberId)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useMemberSales(memberId, page, 'canteen')

  const sales = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  if (isLoading) return <LoadingState message="Carregando pedidos..." />
  if (isError) return <ErrorState onRetry={refetch} />

  if (sales.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum pedido"
        description="Você ainda não fez nenhum pedido na cantina."
      />
    )
  }

  return (
    <div className="space-y-3">
      {sales.map((sale) => (
        <OrderCard key={sale.id} sale={sale} />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}

function OrderCard({ sale }: { sale: SaleItem }) {
  const statusLabel = SALE_STATUS_LABELS[sale.status] ?? sale.status
  const statusVariant = SALE_STATUS_VARIANTS[sale.status] ?? 'outline'

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">
              {sale.itemName ?? 'Item removido'}
            </p>
            {sale.orderNumber && (
              <span className="shrink-0 text-xs text-muted-foreground">
                #{sale.orderNumber}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>{sale.quantity}x {formatCurrency(sale.unitPrice)}</span>
            {sale.paymentMethod && (
              <span>{PAYMENT_METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod}</span>
            )}
            <span>{formatDate(sale.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold tabular-nums">
            {formatCurrency(sale.totalPrice)}
          </span>
          <Badge variant={statusVariant as 'default' | 'secondary' | 'outline' | 'destructive'}>
            {statusLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
