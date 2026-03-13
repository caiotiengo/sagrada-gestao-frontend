'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  ShoppingCart,
  Loader2,
  Minus,
  Plus,
  Trash2,
  Store,
  UtensilsCrossed,
  ShoppingBag,
} from 'lucide-react'

import { useSiteContext } from '@/components/site/site-provider'
import { usePublicStore, usePublicStoreOrder } from '@/hooks/use-public'
import { formatCurrency } from '@/utils'
import { SiteInnerLayout } from '@/components/site/site-inner-layout'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/forms/masked-input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface CartItem {
  itemId: string
  name: string
  price: number
  quantity: number
}

export default function SiteStorePage() {
  const { house } = useSiteContext()
  const { data, isLoading, isError, refetch } = usePublicStore(house.slug)
  const { mutateAsync: createOrderAsync, isPending } = usePublicStoreOrder()

  const [cart, setCart] = useState<CartItem[]>([])
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const { storeItems, canteenItems, allItems } = useMemo(() => {
    if (!data) return { storeItems: [], canteenItems: [], allItems: [] }
    const available = data.items.filter((i) => i.stock > 0)
    return {
      storeItems: available.filter((i) => i.category === 'store'),
      canteenItems: available.filter((i) => i.category === 'canteen'),
      allItems: available,
    }
  }, [data])

  const hasStore = storeItems.length > 0
  const hasCanteen = canteenItems.length > 0
  const hasBoth = hasStore && hasCanteen
  const [activeCategory, setActiveCategory] = useState<'store' | 'canteen'>('store')
  const displayItems = activeCategory === 'store' ? storeItems : canteenItems

  const addToCart = (item: { id: string; name: string; price: number; stock: number }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item.id)
      if (existing) {
        if (existing.quantity >= item.stock) return prev
        return prev.map((c) =>
          c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        )
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.itemId === itemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)

  const handleOrder = async () => {
    if (!buyerName.trim() || !buyerPhone.trim() || cart.length === 0) return
    try {
      const response = await createOrderAsync({
        houseSlug: house.slug,
        items: cart.map((c) => ({ itemId: c.itemId, quantity: c.quantity })),
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      setCart([])
      setBuyerName('')
      setBuyerPhone('')
      setNotes('')
      setOrderNumber(response?.orderNumber ?? '')
      setOrderSuccess(true)
      refetch()
    } catch {
      // error toast handled by hook
    }
  }

  if (isLoading) {
    return (
      <SiteInnerLayout title="Loja">
        <LoadingState message="Carregando produtos..." />
      </SiteInnerLayout>
    )
  }

  if (isError || !data) {
    return (
      <SiteInnerLayout title="Loja">
        <ErrorState title="Erro ao carregar" message="Não foi possível carregar os produtos." onRetry={refetch} />
      </SiteInnerLayout>
    )
  }

  if (orderSuccess) {
    return (
      <SiteInnerLayout title="Loja">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <ShoppingCart className="mx-auto mb-4 size-12 text-[var(--site-primary)]" />
          <h2 className="text-2xl font-bold">Pedido realizado!</h2>
          {orderNumber && (
            <div className="mt-4 rounded-xl border-2 border-[var(--site-primary)]/20 bg-[var(--site-primary)]/5 p-6">
              <p className="text-sm text-gray-500">Número do pedido</p>
              <p className="mt-1 text-3xl font-bold tracking-wider text-[var(--site-primary)]">{orderNumber}</p>
              <p className="mt-2 text-xs text-gray-500">Guarde este número para retirada</p>
            </div>
          )}
          <p className="mt-4 text-gray-500">Seu pedido foi enviado com sucesso.</p>
          <Button className="mt-6" onClick={() => { setOrderSuccess(false); setOrderNumber('') }}>
            Fazer outro pedido
          </Button>
        </div>
      </SiteInnerLayout>
    )
  }

  return (
    <SiteInnerLayout title={hasCanteen && !hasStore ? 'Cantina' : hasStore && !hasCanteen ? 'Loja' : 'Loja & Cantina'}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            {allItems.length > 0 ? (
              <>
                {hasBoth && (
                  <div className="flex gap-1.5 rounded-lg bg-gray-100 p-1">
                    <Button
                      variant={activeCategory === 'store' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => setActiveCategory('store')}
                    >
                      <ShoppingBag className="size-4" />
                      Loja
                      <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[0.625rem]">{storeItems.length}</Badge>
                    </Button>
                    <Button
                      variant={activeCategory === 'canteen' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => setActiveCategory('canteen')}
                    >
                      <UtensilsCrossed className="size-4" />
                      Cantina
                      <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[0.625rem]">{canteenItems.length}</Badge>
                    </Button>
                  </div>
                )}
                {displayItems.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {displayItems.map((item) => {
                      const inCart = cart.find((c) => c.itemId === item.id)
                      return (
                        <Card key={item.id}>
                          <CardContent className="space-y-2 p-4">
                            {item.imageUrl && (
                              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-[var(--site-primary)]">{formatCurrency(item.price)}</span>
                              <Badge variant="outline" className="text-xs">{item.stock} disponível</Badge>
                            </div>
                            {inCart ? (
                              <div className="flex items-center justify-center gap-3">
                                <Button variant="outline" size="icon" className="size-8" onClick={() => updateQuantity(item.id, -1)}>
                                  <Minus className="size-3" />
                                </Button>
                                <span className="w-6 text-center text-sm font-medium">{inCart.quantity}</span>
                                <Button variant="outline" size="icon" className="size-8" onClick={() => updateQuantity(item.id, 1)} disabled={inCart.quantity >= item.stock}>
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addToCart(item)}>
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
                    icon={activeCategory === 'canteen' ? UtensilsCrossed : ShoppingBag}
                    title={`Nenhum item na ${activeCategory === 'canteen' ? 'cantina' : 'loja'}`}
                    description="Não há produtos disponíveis nesta categoria."
                    className="min-h-[20dvh]"
                  />
                )}
              </>
            ) : (
              <EmptyState icon={Store} title="Nenhum produto disponível" description="Não há produtos disponíveis no momento." className="min-h-[20dvh]" />
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="size-4 text-[var(--site-primary)]" />
                  Seu Pedido
                </CardTitle>
                <CardDescription>{cart.length === 0 ? 'Adicione itens ao carrinho' : `${cart.length} item(ns)`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length > 0 && (
                  <>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.itemId} className="flex items-center justify-between gap-2 text-sm">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity}x {formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            <Button variant="ghost" size="icon" className="size-6" onClick={() => removeFromCart(item.itemId)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Seu nome *</label>
                    <Input placeholder="Nome completo" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Telefone *</label>
                    <MaskedInput mask="phone" placeholder="(00) 00000-0000" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Observações (opcional)</label>
                    <Input placeholder="Alguma observação..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
                <Button size="lg" disabled={isPending || cart.length === 0 || !buyerName.trim()} className="w-full" onClick={handleOrder}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? 'Enviando...' : `Fazer Pedido (${formatCurrency(cartTotal)})`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteInnerLayout>
  )
}
