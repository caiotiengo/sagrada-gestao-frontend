'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Heart, Target, Share2, Check, Megaphone, Hammer, Gamepad2, HandCoins,
  ClipboardList, Loader2, Plus, UserPlus, QrCode, Copy, CheckCircle2,
} from 'lucide-react'
import { useCampaigns, useAssignQuota, useAssignQuotaWithPix, useQuotaPaymentStatus } from '@/hooks/use-campaigns'
import { useMember } from '@/hooks/use-members'
import {
  useShoppingLists, useShoppingItems, useCreateShoppingList,
  useAddShoppingItem, useToggleShoppingItem, useSignUpForList,
  useCompleteShoppingList,
} from '@/hooks/use-shopping'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/forms/currency-input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingState } from '@/components/feedback/loading-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/utils'
import { cn } from '@/lib/utils'
import { PixCountdown } from '@/components/pix/pix-countdown'
import { PixQrCode } from '@/components/pix/pix-qrcode'
import { toast } from 'sonner'
import type { CampaignStatus, CampaignItem, ShoppingListItem, ShoppingItem as ShoppingItemType, ShoppingListType } from '@/types'

// ========================================
// Status Config
// ========================================

const statusConfig: Record<CampaignStatus, { label: string; className: string }> = {
  active: { label: 'Ativa', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  completed: { label: 'Concluída', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
}

// ========================================
// Main Page
// ========================================

export default function MemberCampaignsPage() {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <h1 className="text-lg font-bold tracking-tight">Listas</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            <Megaphone className="mr-1.5 size-4" />
            Listas
          </TabsTrigger>
          <TabsTrigger value="job">
            <Hammer className="mr-1.5 size-4" />
            Trabalhos
          </TabsTrigger>
          <TabsTrigger value="game">
            <Gamepad2 className="mr-1.5 size-4" />
            Jogos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list"><MemberCampaignsTab /></TabsContent>
        <TabsContent value="job"><MemberShoppingTab type="job" /></TabsContent>
        <TabsContent value="game"><MemberShoppingTab type="game" /></TabsContent>
      </Tabs>
    </div>
  )
}

// ========================================
// Campaigns Tab (arrecadação)
// ========================================

function ShareButton({ campaign }: { campaign: CampaignItem }) {
  const { currentHouse } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const houseSlug = currentHouse?.houseSlug

  if (!houseSlug || !campaign.isPublic) return null

  const url = `${window.location.origin}${ROUTES.PUBLIC_CAMPAIGN(houseSlug, campaign.slug)}`

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: campaign.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleShare} aria-label="Compartilhar">
      {copied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
    </Button>
  )
}

function MemberCampaignsTab() {
  const { data, isLoading, isError, refetch } = useCampaigns(1, 'active')
  const houseId = useAuthStore((s) => s.currentHouseId())
  const memberId = useAuthStore((s) => s.currentHouse?.memberId)
  const profile = useAuthStore((s) => s.profile)
  const { data: memberDetails } = useMember(memberId ?? '')
  const assignQuota = useAssignQuota()
  const assignQuotaWithPix = useAssignQuotaWithPix()

  const [participateDialogOpen, setParticipateDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null)
  const [quotaAmount, setQuotaAmount] = useState(0)
  const [paymentChoiceOpen, setPaymentChoiceOpen] = useState(false)
  const [pixData, setPixData] = useState<{ quotaId: string; amount: number; pixEmv: string; startedAt: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const isPending = assignQuota.isPending || assignQuotaWithPix.isPending
  const memberCpf = memberDetails?.mediumProfile?.cpf || memberDetails?.user?.documentNumber || ''

  // Poll quota payment status
  const { data: statusData } = useQuotaPaymentStatus(pixData?.quotaId ?? null)

  useEffect(() => {
    if (statusData?.isPaid && pixData) {
      setPixData(null)
      refetch()
      toast.success('Pagamento confirmado! Cota paga com sucesso.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusData?.isPaid, pixData])

  const copyPixCode = useCallback(async () => {
    if (!pixData?.pixEmv) return
    try {
      await navigator.clipboard.writeText(pixData.pixEmv)
      setCopied(true)
      toast.success('Codigo PIX copiado!')
      setTimeout(() => setCopied(false), 3000)
    } catch { toast.error('Erro ao copiar') }
  }, [pixData?.pixEmv])

  const handleConfirmAmount = () => {
    if (!quotaAmount) return
    setParticipateDialogOpen(false)
    setPaymentChoiceOpen(true)
  }

  const handlePaymentChoice = (choice: 'pix' | 'later') => {
    if (!houseId || !memberId || !selectedCampaign || !quotaAmount) return
    if (choice === 'pix' && quotaAmount < 5) {
      toast.error('Valor minimo para pagamento via PIX e R$ 5,00')
      return
    }
    setPaymentChoiceOpen(false)

    if (choice === 'later') {
      assignQuota.mutate(
        { houseId, campaignId: selectedCampaign.id, memberId, amount: quotaAmount },
        { onSuccess: () => { setSelectedCampaign(null); setQuotaAmount(0) } },
      )
    } else {
      if (!memberCpf || memberCpf.replace(/\D/g, '').length < 11) {
        toast.error('CPF nao encontrado no seu cadastro. Atualize seu perfil.')
        return
      }
      assignQuotaWithPix.mutate(
        { houseId, campaignId: selectedCampaign.id, memberId, amount: quotaAmount, buyerDocument: memberCpf },
        {
          onSuccess: (result) => {
            if (result.pix?.emv) {
              setPixData({ quotaId: result.quotaId, amount: quotaAmount, pixEmv: result.pix.emv, startedAt: Date.now() })
            }
            setQuotaAmount(0)
          },
        },
      )
    }
  }

  const campaigns: CampaignItem[] = data?.data ?? []

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  if (campaigns.length === 0) {
    return <EmptyState icon={Heart} title="Nenhuma lista ativa" description="No momento não há listas de arrecadação ativas." />
  }

  return (
    <>
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const percentage = campaign.goalAmount > 0
            ? Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100)
            : 0
          const status = statusConfig[campaign.status]

          return (
            <Card key={campaign.id} className="rounded-xl shadow-sm">
              <CardContent className="space-y-3 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">{campaign.title}</h2>
                    {campaign.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShareButton campaign={campaign} />
                    <Badge variant="secondary" className={status.className}>{status.label}</Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Progress value={percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="size-3" />
                      {formatCurrency(campaign.currentAmount)} de {formatCurrency(campaign.goalAmount)}
                    </span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                </div>

                {campaign.startDate && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(campaign.startDate)}
                    {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                  </p>
                )}

                {campaign.status === 'active' && (
                  <Button variant="outline" size="sm" className="mt-2 gap-2"
                    onClick={() => { setSelectedCampaign(campaign); setQuotaAmount(0); setParticipateDialogOpen(true) }}>
                    <HandCoins className="size-4" />Adicionar cota
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Amount Dialog */}
      <Dialog open={participateDialogOpen} onOpenChange={(open) => { setParticipateDialogOpen(open); if (!open) { setSelectedCampaign(null); setQuotaAmount(0) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cota</DialogTitle>
            <DialogDescription>{selectedCampaign?.title} — Informe o valor da sua cota.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <CurrencyInput value={quotaAmount} onValueChange={setQuotaAmount} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleConfirmAmount} disabled={!quotaAmount}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Choice Dialog */}
      <Dialog open={paymentChoiceOpen} onOpenChange={setPaymentChoiceOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pb-5 pt-6 text-primary-foreground">
            <p className="text-sm font-medium text-primary-foreground/70">{selectedCampaign?.title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{formatCurrency(quotaAmount)}</p>
            <p className="mt-1 text-sm text-primary-foreground/80">{profile?.fullName}</p>
          </div>
          <div className="px-6 pb-6 pt-4">
            <p className="mb-4 text-sm font-medium text-foreground">Como deseja pagar?</p>
            <div className="space-y-3">
              <button type="button" className="flex w-full items-center gap-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/10 disabled:opacity-50" onClick={() => handlePaymentChoice('pix')} disabled={isPending}>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"><QrCode className="size-6 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Pagar agora com PIX</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Gere o codigo PIX e pague na hora</p>
                </div>
              </button>
              <button type="button" className="flex w-full items-center gap-4 rounded-xl border-2 border-muted p-4 text-left transition-all hover:border-muted-foreground/30 hover:bg-muted/50 disabled:opacity-50" onClick={() => handlePaymentChoice('later')} disabled={isPending}>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted"><HandCoins className="size-6 text-muted-foreground" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Pagar depois</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Registre a cota e combine o pagamento</p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIX Payment Dialog */}
      <Dialog open={!!pixData} onOpenChange={(open) => { if (!open) setPixData(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><QrCode className="size-4 text-primary" />Pagar com PIX</DialogTitle>
          </DialogHeader>
          {pixData && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{formatCurrency(pixData.amount)}</p>
              </div>
              <PixQrCode emv={pixData.pixEmv} />
              <div className="space-y-2">
                <p className="text-sm font-medium">Ou copie o codigo PIX</p>
                <div className="max-h-20 overflow-y-auto rounded-md border bg-muted/30 p-3 text-xs break-all font-mono">{pixData.pixEmv}</div>
                <Button onClick={copyPixCode} variant={copied ? 'default' : 'outline'} className="w-full" size="lg">
                  {copied ? <><CheckCircle2 className="size-4" />Copiado!</> : <><Copy className="size-4" />Copiar codigo PIX</>}
                </Button>
              </div>
              <PixCountdown
                startedAt={pixData.startedAt}
                onExpired={() => {
                  setPixData(null)
                  toast.info('PIX expirado. Sua cota foi registrada para pagamento posterior.')
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// ========================================
// Shopping Tab (Listas / Trabalhos / Jogos)
// ========================================

const typeEmptyConfig: Record<ShoppingListType, { icon: typeof Heart; title: string; description: string }> = {
  list: { icon: ClipboardList, title: 'Nenhuma lista ativa', description: 'No momento não há listas ativas.' },
  job: { icon: Hammer, title: 'Nenhum trabalho ativo', description: 'No momento não há trabalhos disponíveis.' },
  game: { icon: Gamepad2, title: 'Nenhum jogo ativo', description: 'No momento não há jogos disponíveis.' },
}

function MemberShoppingTab({ type }: { type: ShoppingListType }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const { data, isLoading, isError, refetch } = useShoppingLists(1, type, 'active')
  const createList = useCreateShoppingList()
  const signUp = useSignUpForList()

  const lists = data?.data ?? []
  const empty = typeEmptyConfig[type]
  const canCreate = type === 'list'

  const handleCreate = () => {
    if (!houseId || !title.trim()) return
    createList.mutate(
      { houseId, title: title.trim(), description: description.trim() || undefined, type },
      { onSettled: (_, error) => { if (!error) { setDialogOpen(false); setTitle(''); setDescription('') } } },
    )
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  if (lists.length === 0) {
    return (
      <EmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        action={canCreate ? { label: 'Criar Lista', onClick: () => setDialogOpen(true) } : undefined}
      />
    )
  }

  return (
    <>
      {canCreate && (
        <div className="mb-4 flex justify-end">
          <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />Nova Lista
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {lists.map((list) => (
          <MemberShoppingCard
            key={list.id}
            list={list}
            type={type}
            isExpanded={expandedId === list.id}
            onToggleExpand={() => setExpandedId(expandedId === list.id ? null : list.id)}
            houseId={houseId}
            signUp={signUp}
          />
        ))}
      </div>

      {canCreate && (
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setTitle(''); setDescription('') } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Lista</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input placeholder="Nome da lista" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={handleCreate} disabled={createList.isPending || !title.trim()}>
                {createList.isPending ? 'Criando...' : 'Criar Lista'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function MemberShoppingCard({
  list, type, isExpanded, onToggleExpand, houseId, signUp,
}: {
  list: ShoppingListItem
  type: ShoppingListType
  isExpanded: boolean
  onToggleExpand: () => void
  houseId?: string | null
  signUp: ReturnType<typeof useSignUpForList>
}) {
  const { data: items, isLoading: itemsLoading } = useShoppingItems(isExpanded ? list.id : null)
  const addItem = useAddShoppingItem()
  const toggleItem = useToggleShoppingItem()
  const completeList = useCompleteShoppingList()
  const memberId = useAuthStore((s) => s.currentHouse?.memberId)

  const [newItemName, setNewItemName] = useState('')

  const shoppingItems: ShoppingItemType[] = items ?? []
  const purchasedCount = shoppingItems.filter((i) => i.isPurchased).length
  const alreadySignedUp = shoppingItems.some((i) => i.memberId === memberId)

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!houseId || !newItemName.trim()) return
    addItem.mutate(
      { houseId, listId: list.id, name: newItemName.trim() },
      { onSuccess: () => setNewItemName('') },
    )
  }

  const handleSignUp = () => {
    if (!houseId) return
    signUp.mutate({ houseId, listId: list.id })
  }

  const statusBadge = list.isCompleted
    ? { label: 'Finalizada', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' }
    : { label: 'Ativa', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-0">
        <button type="button" onClick={onToggleExpand} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{list.title}</h3>
              <Badge variant="secondary" className={statusBadge.className}>{statusBadge.label}</Badge>
              {list.price != null && list.price > 0 && (
                <Badge variant="outline" className="text-xs">{formatCurrency(list.price)}</Badge>
              )}
            </div>
            {list.description && <p className="mt-0.5 text-xs text-muted-foreground">{list.description}</p>}
            {isExpanded && type === 'list' && shoppingItems.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">{purchasedCount} de {shoppingItems.length} itens comprados</p>
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-border/50 px-4 pb-4 pt-3">
            {itemsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {type === 'list' ? (
                  <>
                    {shoppingItems.length > 0 ? (
                      <ul className="space-y-1">
                        {shoppingItems.map((item) => (
                          <li key={item.id} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
                            <Checkbox
                              checked={item.isPurchased}
                              onCheckedChange={() => { if (!houseId) return; toggleItem.mutate({ houseId, itemId: item.id, isPurchased: !item.isPurchased }) }}
                              disabled={list.isCompleted}
                            />
                            <span className={cn('flex-1 text-sm', item.isPurchased && 'text-muted-foreground line-through')}>
                              {item.name}
                              {item.quantity && item.quantity > 1 && (
                                <span className="ml-1 text-xs text-muted-foreground">x{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="py-3 text-center text-sm text-muted-foreground">Nenhum item adicionado ainda.</p>
                    )}

                    {!list.isCompleted && (
                      <form onSubmit={handleAddItem} className="mt-3 flex items-center gap-2">
                        <Input placeholder="Adicionar item..." value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="h-8 text-sm" />
                        <Button type="submit" size="sm" variant="outline" disabled={addItem.isPending || !newItemName.trim()} className="shrink-0">
                          <Plus className="size-4" />
                        </Button>
                      </form>
                    )}

                    {!list.isCompleted && shoppingItems.length > 0 && (
                      <Button size="sm" variant="outline" className="mt-3 w-full"
                        onClick={() => { if (!houseId) return; completeList.mutate({ houseId, listId: list.id }) }}
                        disabled={completeList.isPending}>
                        <Check className="mr-1.5 size-3.5" />Finalizar lista
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {shoppingItems.length > 0 ? (
                      <ul className="space-y-1.5">
                        {shoppingItems.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-2 rounded-md px-1 py-1.5 text-sm">
                            <span>{item.memberName ?? item.name}</span>
                            {item.isPaid === true ? (
                              <Badge variant="default" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Pago</Badge>
                            ) : item.isPaid === false ? (
                              <Badge variant="outline">Pendente</Badge>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="py-3 text-center text-sm text-muted-foreground">Nenhuma inscrição ainda.</p>
                    )}

                    {!list.isCompleted && !alreadySignedUp && list.assignedMemberIds.length !== 1 && (
                      <Button size="sm" className="mt-3 w-full gap-2" onClick={handleSignUp} disabled={signUp.isPending}>
                        {signUp.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                        {signUp.isPending ? 'Inscrevendo...' : type === 'job' ? 'Participar' : 'Inscrever-se'}
                      </Button>
                    )}
                    {alreadySignedUp && (
                      <p className="mt-3 text-center text-xs text-muted-foreground">Você já está inscrito(a)</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
