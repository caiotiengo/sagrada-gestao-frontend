'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus, Megaphone, Eye, EyeOff, Copy, Ban, MoreVertical, ExternalLink,
  Search, Hammer, Gamepad2, Users, Pencil, Heart, Archive, Trash2,
  CheckCircle, Loader2, DollarSign, ClipboardList, ChevronDown, Check, UserPlus,
} from 'lucide-react'
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/hooks/use-campaigns'
import {
  useShoppingLists, useShoppingItems, useCreateShoppingList,
  useUpdateShoppingList, useDeleteShoppingList, useArchiveShoppingList,
  useCompleteShoppingList, useAddShoppingItem, useToggleShoppingItem,
  useConfirmListPayment, useAdminSignUpMember, useDeleteShoppingItem,
} from '@/hooks/use-shopping'
import { useAllMembers } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/utils'
import type {
  CampaignStatus, CampaignItem, UpdateCampaignRequest, DeleteCampaignRequest,
  ShoppingListItem, ShoppingItem as ShoppingItemType, ShoppingListType,
} from '@/types'
import type { UseMutationResult } from '@tanstack/react-query'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/forms/currency-input'
import { DateInput } from '@/components/forms/date-input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

// ========================================
// Main Page
// ========================================

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Listas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie listas, trabalhos e jogos
        </p>
      </div>

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

        <TabsContent value="list">
          <CampaignsTab />
        </TabsContent>
        <TabsContent value="job">
          <ShoppingTab type="job" />
        </TabsContent>
        <TabsContent value="game">
          <ShoppingTab type="game" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ========================================
// Config
// ========================================

const statusLabel: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

const statusVariant: Record<CampaignStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  active: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

const typeConfig: Record<ShoppingListType, {
  label: string; singular: string; description: string
  emptyTitle: string; emptyDescription: string
  icon: typeof Heart
}> = {
  list: {
    label: 'Listas',
    singular: 'Lista',
    description: 'Listas de compras e itens',
    emptyTitle: 'Nenhuma lista criada',
    emptyDescription: 'Crie listas de compras para a casa.',
    icon: ClipboardList,
  },
  job: {
    label: 'Trabalhos',
    singular: 'Trabalho',
    description: 'Trabalhos com inscrição e pagamento',
    emptyTitle: 'Nenhum trabalho criado',
    emptyDescription: 'Crie trabalhos e direcione para membros.',
    icon: Hammer,
  },
  game: {
    label: 'Jogos',
    singular: 'Jogo',
    description: 'Jogos e atividades',
    emptyTitle: 'Nenhum jogo criado',
    emptyDescription: 'Crie jogos para a casa.',
    icon: Gamepad2,
  },
}

// ========================================
// Campaigns Tab
// ========================================

function CampaignsTab() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([])

  const houseId = useAuthStore((s) => s.currentHouseId())
  const houseSlug = useAuthStore((s) => s.currentHouse?.houseSlug)
  const canManage = useAuthStore((s) => s.hasPermission('canManageCampaigns'))

  const { data, isLoading, isError, refetch } = useCampaigns(page)
  const createCampaign = useCreateCampaign()
  const updateCampaign = useUpdateCampaign()
  const deleteCampaign = useDeleteCampaign()
  const { data: membersData } = useAllMembers()

  const campaigns = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1
  const members = membersData?.data ?? []

  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return campaigns
    const query = search.toLowerCase()
    return campaigns.filter((c) => c.title.toLowerCase().includes(query))
  }, [campaigns, search])

  const resetForm = () => {
    setTitle(''); setDescription(''); setGoalAmount(0); setStartDate(''); setIsPublic(false); setAssignedMemberIds([])
  }

  const handleCreate = () => {
    if (!houseId || !title.trim() || !description.trim() || !goalAmount || !startDate) return
    createCampaign.mutate(
      {
        houseId, title: title.trim(), description: description.trim(), goalAmount, startDate, isPublic,
        assignedMemberIds: assignedMemberIds.length > 0 ? assignedMemberIds : undefined,
      },
      { onSettled: (_, error) => { if (!error) { setDialogOpen(false); resetForm() } } },
    )
  }

  if (isError) return <ErrorState title="Erro ao carregar listas" onRetry={() => refetch()} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Listas de arrecadação</p>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger render={<Button size="sm" className="shrink-0 gap-2" />}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nova Lista</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Lista</DialogTitle>
                <DialogDescription>Preencha os dados da lista de arrecadação.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input placeholder="Nome da lista" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Input placeholder="Descreva o objetivo" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta (R$)</label>
                  <CurrencyInput value={goalAmount} onValueChange={setGoalAmount} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de início</label>
                  <DateInput value={startDate} onValueChange={setStartDate} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPublic-campaign" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="size-4 rounded border-input" />
                  <label htmlFor="isPublic-campaign" className="text-sm font-medium">Lista pública</label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Direcionar para membros (opcional)</label>
                  <Popover>
                    <PopoverTrigger
                      className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-accent/50 dark:bg-input/30"
                    >
                      <span className={cn('truncate', assignedMemberIds.length === 0 && 'text-muted-foreground/60')}>
                        {assignedMemberIds.length === 0
                          ? 'Selecionar membros...'
                          : assignedMemberIds.length === members.length
                            ? 'Todos os membros'
                            : `${assignedMemberIds.length} membro(s)`}
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </PopoverTrigger>
                    <PopoverContent className="w-(--anchor-width) p-0" align="start">
                      <div className="max-h-48 overflow-y-auto p-1">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
                          onClick={() => {
                            setAssignedMemberIds(
                              assignedMemberIds.length === members.length ? [] : members.map((m) => m.id),
                            )
                          }}
                        >
                          <div className={cn(
                            'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                            members.length > 0 && assignedMemberIds.length === members.length
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-input',
                          )}>
                            {members.length > 0 && assignedMemberIds.length === members.length && <Check className="size-3" />}
                          </div>
                          Selecionar todos
                        </button>
                        <div className="my-1 h-px bg-border" />
                        {members.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                            onClick={() => {
                              setAssignedMemberIds((prev) =>
                                prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id],
                              )
                            }}
                          >
                            <div className={cn(
                              'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                              assignedMemberIds.includes(m.id)
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input',
                            )}>
                              {assignedMemberIds.includes(m.id) && <Check className="size-3" />}
                            </div>
                            {m.fullName}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                <Button onClick={handleCreate} disabled={createCampaign.isPending || !title.trim() || !description.trim() || !goalAmount || !startDate}>
                  {createCampaign.isPending ? 'Criando...' : 'Criar Lista'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              houseId={houseId}
              houseSlug={houseSlug}
              canManage={canManage}
              updateCampaign={updateCampaign}
              deleteCampaign={deleteCampaign}
              refetch={refetch}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="Nenhuma lista"
          description="Crie listas de arrecadação."
          action={canManage ? { label: 'Criar Lista', onClick: () => setDialogOpen(true) } : undefined}
        />
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <span className="text-sm text-muted-foreground">{page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
        </div>
      )}
    </div>
  )
}

// ========================================
// Campaign Card
// ========================================

function getProgressPercent(campaign: CampaignItem): number {
  if (campaign.goalAmount <= 0) return 0
  return Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100))
}

function CampaignCard({
  campaign, houseId, houseSlug, canManage, updateCampaign, deleteCampaign, refetch,
}: {
  campaign: CampaignItem
  houseId?: string | null
  houseSlug?: string | null
  canManage?: boolean
  updateCampaign: UseMutationResult<CampaignItem, Error, UpdateCampaignRequest>
  deleteCampaign: UseMutationResult<{ message: string }, Error, DeleteCampaignRequest>
  refetch: () => void
}) {
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(campaign.title)
  const [editDescription, setEditDescription] = useState(campaign.description)
  const [editGoalAmount, setEditGoalAmount] = useState(campaign.goalAmount)
  const [editEndDate, setEditEndDate] = useState(campaign.endDate ?? '')

  const percent = getProgressPercent(campaign)
  const isEditable = canManage && campaign.status !== 'cancelled' && campaign.status !== 'completed'

  const handleEdit = () => {
    if (!houseId) return
    updateCampaign.mutate(
      { houseId, campaignId: campaign.id, title: editTitle.trim(), description: editDescription.trim(), goalAmount: editGoalAmount, endDate: editEndDate || undefined },
      { onSuccess: () => { setEditDialogOpen(false); refetch() } },
    )
  }

  const handleToggleVisibility = () => {
    if (!houseId) return
    updateCampaign.mutate(
      { houseId, campaignId: campaign.id, isPublic: !campaign.isPublic },
      { onSuccess: () => refetch() },
    )
  }

  return (
    <Card className="rounded-xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 p-4">
          <Link href={ROUTES.ADMIN_CAMPAIGN_DETAIL(campaign.id)} className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold hover:underline">{campaign.title}</h3>
              <Badge variant={statusVariant[campaign.status]}>{statusLabel[campaign.status]}</Badge>
              {campaign.isPublic ? <Eye className="size-3.5 shrink-0 text-muted-foreground" /> : <EyeOff className="size-3.5 shrink-0 text-muted-foreground" />}
            </div>
            {campaign.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{campaign.description}</p>}
            {campaign.assignedMemberIds.length > 0 && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                <span>{campaign.assignedMemberIds.length} membro(s) direcionado(s)</span>
              </div>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 shrink-0" />}>
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { window.location.href = ROUTES.ADMIN_CAMPAIGN_DETAIL(campaign.id) }}>
                <ExternalLink className="size-4" />Ver detalhes
              </DropdownMenuItem>
              {isEditable && (
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="size-4" />Editar
                </DropdownMenuItem>
              )}
              {isEditable && (
                <DropdownMenuItem onClick={handleToggleVisibility}>
                  {campaign.isPublic ? <><EyeOff className="size-4" />Esconder</> : <><Eye className="size-4" />Tornar público</>}
                </DropdownMenuItem>
              )}
              {campaign.isPublic && houseSlug && campaign.slug && (
                <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${ROUTES.PUBLIC_CAMPAIGN(houseSlug, campaign.slug)}`); toast.success('Link copiado!') }}>
                  <Copy className="size-4" />Copiar link
                </DropdownMenuItem>
              )}
              {isEditable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setCancelAlertOpen(true)}>
                    <Ban className="size-4" />Cancelar lista
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress + dates */}
        <div className="space-y-2 border-t border-border/50 px-4 py-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(campaign.currentAmount)} de {formatCurrency(campaign.goalAmount)}</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Início: {formatDate(campaign.startDate)}</span>
            {campaign.endDate && <span>Fim: {formatDate(campaign.endDate)}</span>}
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (open) { setEditTitle(campaign.title); setEditDescription(campaign.description); setEditGoalAmount(campaign.goalAmount); setEditEndDate(campaign.endDate ?? '') }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lista</DialogTitle>
            <DialogDescription>Altere os dados da lista.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Título</label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Descrição</label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Meta (R$)</label><CurrencyInput value={editGoalAmount} onValueChange={setEditGoalAmount} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Data de encerramento (opcional)</label><DateInput value={editEndDate} onValueChange={setEditEndDate} /></div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleEdit} disabled={updateCampaign.isPending || !editTitle.trim() || !editDescription.trim() || !editGoalAmount}>
              {updateCampaign.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel AlertDialog */}
      <AlertDialog open={cancelAlertOpen} onOpenChange={setCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar lista?</AlertDialogTitle>
            <AlertDialogDescription>Será cancelada e não poderá mais receber contribuições. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (!houseId) return; deleteCampaign.mutate({ houseId, campaignId: campaign.id }, { onSuccess: () => { setCancelAlertOpen(false); refetch() } }) }} disabled={deleteCampaign.isPending}>
              {deleteCampaign.isPending ? 'Cancelando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// ========================================
// Shopping Lists / Trabalhos / Jogos Tab
// ========================================

function ShoppingTab({ type }: { type: ShoppingListType }) {
  const config = typeConfig[type]
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManageJobs = useAuthStore((s) => s.hasPermission('canManageJobs'))
  const canManageGames = useAuthStore((s) => s.hasPermission('canManageGames'))
  const canManage = type === 'job' ? canManageJobs : type === 'game' ? canManageGames : true

  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  // Create form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([])

  const { data, isLoading, isError, refetch } = useShoppingLists(page, type, showCompleted ? 'completed' : 'active')
  const createList = useCreateShoppingList()
  const updateList = useUpdateShoppingList()
  const deleteList = useDeleteShoppingList()
  const archiveList = useArchiveShoppingList()
  const completeList = useCompleteShoppingList()
  const confirmPayment = useConfirmListPayment()
  const adminSignUp = useAdminSignUpMember()
  const { data: membersData } = useAllMembers()

  const lists = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1
  const members = membersData?.data ?? []

  const canCreate = canManage

  const resetForm = () => {
    setTitle(''); setDescription(''); setPrice(0); setAssignedMemberIds([])
  }

  const handleCreate = () => {
    if (!houseId || !title.trim()) return
    createList.mutate(
      {
        houseId,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        price: (type === 'job' || type === 'game') && price > 0 ? price : undefined,
        assignedMemberIds: assignedMemberIds.length > 0 ? assignedMemberIds : undefined,
      },
      { onSettled: (_, error) => { if (!error) { setDialogOpen(false); resetForm() } } },
    )
  }

  if (isError) return <ErrorState title={`Erro ao carregar ${config.label.toLowerCase()}`} onRetry={() => refetch()} />

  return (
    <div className="space-y-4">
      {/* Status toggle */}
      <div className="flex gap-1">
        <Button
          variant={!showCompleted ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setShowCompleted(false); setPage(1) }}
        >
          Ativos
        </Button>
        <Button
          variant={showCompleted ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setShowCompleted(true); setPage(1) }}
        >
          Finalizados
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{config.description}</p>
        {canCreate && !showCompleted && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger render={<Button size="sm" className="shrink-0 gap-2" />}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">Novo {config.singular}</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar {config.singular}</DialogTitle>
                <DialogDescription>Preencha os dados.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input placeholder={`Nome do ${config.singular.toLowerCase()}`} value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição (opcional)</label>
                  <Input placeholder="Descreva brevemente" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                {(type === 'job' || type === 'game') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor de inscrição (opcional)</label>
                    <CurrencyInput value={price} onValueChange={setPrice} />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Direcionar para membros (opcional)</label>
                  <Popover>
                      <PopoverTrigger
                        className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-accent/50 data-placeholder:text-muted-foreground/60 dark:bg-input/30"
                      >
                        <span className={cn('truncate', assignedMemberIds.length === 0 && 'text-muted-foreground/60')}>
                          {assignedMemberIds.length === 0
                            ? 'Selecionar membros...'
                            : assignedMemberIds.length === members.length
                              ? 'Todos os membros'
                              : `${assignedMemberIds.length} membro(s)`}
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent className="w-(--anchor-width) p-0" align="start">
                        <div className="max-h-48 overflow-y-auto p-1">
                          <button
                            type="button"
                            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
                            onClick={() => {
                              setAssignedMemberIds(
                                assignedMemberIds.length === members.length ? [] : members.map((m) => m.id),
                              )
                            }}
                          >
                            <div className={cn(
                              'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                              members.length > 0 && assignedMemberIds.length === members.length
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input',
                            )}>
                              {members.length > 0 && assignedMemberIds.length === members.length && <Check className="size-3" />}
                            </div>
                            Selecionar todos
                          </button>
                          <div className="my-1 h-px bg-border" />
                          {members.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                              onClick={() => {
                                setAssignedMemberIds((prev) =>
                                  prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id],
                                )
                              }}
                            >
                              <div className={cn(
                                'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                                assignedMemberIds.includes(m.id)
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-input',
                              )}>
                                {assignedMemberIds.includes(m.id) && <Check className="size-3" />}
                              </div>
                              {m.fullName}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                <Button onClick={handleCreate} disabled={createList.isPending || !title.trim()}>
                  {createList.isPending ? 'Criando...' : `Criar ${config.singular}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : lists.length > 0 ? (
        <div className="space-y-3">
          {lists.map((list) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              type={type}
              isExpanded={expandedId === list.id}
              onToggleExpand={() => setExpandedId(expandedId === list.id ? null : list.id)}
              houseId={houseId}
              canManage={canManage}
              updateList={updateList}
              deleteList={deleteList}
              archiveList={archiveList}
              completeList={completeList}
              confirmPayment={confirmPayment}
              adminSignUp={adminSignUp}
              members={members}
              refetch={refetch}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={config.icon}
          title={config.emptyTitle}
          description={config.emptyDescription}
          action={canCreate ? { label: `Criar ${config.singular}`, onClick: () => setDialogOpen(true) } : undefined}
        />
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <span className="text-sm text-muted-foreground">{page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
        </div>
      )}
    </div>
  )
}

// ========================================
// Shopping List Card (expandable)
// ========================================

function ShoppingListCard({
  list, type, isExpanded, onToggleExpand, houseId, canManage,
  updateList, deleteList, archiveList, completeList, confirmPayment, adminSignUp, members, refetch,
}: {
  list: ShoppingListItem
  type: ShoppingListType
  isExpanded: boolean
  onToggleExpand: () => void
  houseId?: string | null
  canManage?: boolean
  updateList: ReturnType<typeof useUpdateShoppingList>
  deleteList: ReturnType<typeof useDeleteShoppingList>
  archiveList: ReturnType<typeof useArchiveShoppingList>
  completeList: ReturnType<typeof useCompleteShoppingList>
  confirmPayment: ReturnType<typeof useConfirmListPayment>
  adminSignUp: ReturnType<typeof useAdminSignUpMember>
  members: { id: string; fullName: string }[]
  refetch: () => void
}) {
  const [newItemName, setNewItemName] = useState('')
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(list.title)
  const [editDescription, setEditDescription] = useState(list.description ?? '')

  const { data: items, isLoading: itemsLoading } = useShoppingItems(isExpanded || editDialogOpen ? list.id : null)
  const addItem = useAddShoppingItem()
  const toggleItem = useToggleShoppingItem()
  const deleteShoppingItem = useDeleteShoppingItem()
  const [deleteItemAlertId, setDeleteItemAlertId] = useState<string | null>(null)

  const shoppingItems: ShoppingItemType[] = items ?? []

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!houseId || !newItemName.trim()) return
    addItem.mutate(
      { houseId, listId: list.id, name: newItemName.trim() },
      { onSuccess: () => setNewItemName('') },
    )
  }

  const handleToggleItem = (item: ShoppingItemType) => {
    if (!houseId) return
    toggleItem.mutate({ houseId, itemId: item.id, isPurchased: !item.isPurchased })
  }

  const handleEdit = () => {
    if (!houseId) return
    updateList.mutate(
      { houseId, listId: list.id, title: editTitle.trim(), description: editDescription.trim() || undefined },
      { onSuccess: () => { setEditDialogOpen(false); refetch() } },
    )
  }

  return (
    <Card className="rounded-xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 p-4">
          <button type="button" onClick={onToggleExpand} className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{list.title}</h3>
              <Badge variant={list.isCompleted ? 'secondary' : 'default'}>
                {list.isCompleted ? 'Finalizada' : 'Ativa'}
              </Badge>
              {list.price != null && list.price > 0 && (
                <Badge variant="outline" className="text-xs">{formatCurrency(list.price)}</Badge>
              )}
            </div>
            {list.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{list.description}</p>}
            {list.assignedMemberIds.length > 0 && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                <span>{list.assignedMemberIds.length} membro(s) direcionado(s)</span>
              </div>
            )}
          </button>

          {canManage && !list.isCompleted && (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 shrink-0" />}>
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setEditTitle(list.title); setEditDescription(list.description ?? ''); setEditDialogOpen(true) }}>
                  <Pencil className="size-4" />Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { if (!houseId) return; completeList.mutate({ houseId, listId: list.id }, { onSuccess: () => refetch() }) }}>
                  <CheckCircle className="size-4" />Finalizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { if (!houseId) return; archiveList.mutate({ houseId, listId: list.id }, { onSuccess: () => refetch() }) }}>
                  <Archive className="size-4" />Arquivar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteAlertOpen(true)}>
                  <Trash2 className="size-4" />Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-border/50 px-4 pb-4 pt-3">
            {itemsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {shoppingItems.length > 0 ? (
                  <ul className="space-y-1">
                    {shoppingItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
                        {type === 'list' ? (
                          <>
                            <Checkbox
                              checked={item.isPurchased}
                              onCheckedChange={() => handleToggleItem(item)}
                              disabled={list.isCompleted}
                            />
                            <span className={cn('flex-1 text-sm', item.isPurchased && 'text-muted-foreground line-through')}>
                              {item.name}
                              {item.quantity && item.quantity > 1 && (
                                <span className="ml-1 text-xs text-muted-foreground">x{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                              )}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">
                              {item.memberName ?? item.name}
                            </span>
                            {item.isPaid === true ? (
                              <div className="flex items-center gap-1.5">
                                <Badge variant="default" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Pago</Badge>
                                {canManage && !list.isCompleted && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => { if (!houseId) return; confirmPayment.mutate({ houseId, itemId: item.id, isPaid: false }) }}
                                    disabled={confirmPayment.isPending}
                                    title="Reverter para pendente"
                                  >
                                    <Ban className="size-3.5 text-destructive" />
                                  </Button>
                                )}
                                {canManage && !list.isCompleted && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setDeleteItemAlertId(item.id)}
                                    title="Excluir inscrição"
                                  >
                                    <Trash2 className="size-3.5 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            ) : item.isPaid === false ? (
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline">Pendente</Badge>
                                {canManage && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => { if (!houseId) return; confirmPayment.mutate({ houseId, itemId: item.id, isPaid: true }) }}
                                    disabled={confirmPayment.isPending}
                                    title="Confirmar pagamento"
                                  >
                                    <DollarSign className="size-3.5 text-emerald-600" />
                                  </Button>
                                )}
                                {canManage && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setDeleteItemAlertId(item.id)}
                                    title="Excluir inscrição"
                                  >
                                    <Trash2 className="size-3.5 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            ) : null}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    {type === 'list' ? 'Nenhum item adicionado ainda.' : 'Nenhuma inscrição ainda.'}
                  </p>
                )}

                {/* Delete Shopping Item AlertDialog */}
                <AlertDialog open={!!deleteItemAlertId} onOpenChange={(open) => { if (!open) setDeleteItemAlertId(null) }}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir inscrição?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A inscrição será removida permanentemente e os valores pagos serão revertidos nos saldos.
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          if (!houseId || !deleteItemAlertId) return
                          deleteShoppingItem.mutate(
                            { houseId, itemId: deleteItemAlertId },
                            { onSuccess: () => setDeleteItemAlertId(null) },
                          )
                        }}
                        disabled={deleteShoppingItem.isPending}
                      >
                        {deleteShoppingItem.isPending ? 'Excluindo...' : 'Excluir'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Add item form (only for lists) */}
                {type === 'list' && !list.isCompleted && (
                  <form onSubmit={handleAddItem} className="mt-3 flex items-center gap-2">
                    <Input
                      placeholder="Adicionar item..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button type="submit" size="sm" variant="outline" disabled={addItem.isPending || !newItemName.trim()} className="shrink-0">
                      <Plus className="size-4" />
                    </Button>
                  </form>
                )}

              </>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {typeConfig[type].singular}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Título</label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Descrição</label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
            {type !== 'list' && !list.isCompleted && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Membros inscritos</label>
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <Popover>
                      <PopoverTrigger
                        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="truncate text-muted-foreground">
                          {(() => {
                            const signedUpCount = members.filter((m) => shoppingItems.some((i) => i.memberId === m.id)).length
                            if (signedUpCount === 0) return 'Selecionar membros...'
                            if (signedUpCount === members.length) return 'Todos os membros selecionados'
                            return `${signedUpCount} membro(s) inscrito(s)`
                          })()}
                        </span>
                        <ChevronDown className="size-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar membro..." />
                          <CommandList>
                            <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                            <CommandGroup>
                              {/* Select all */}
                              <CommandItem
                                onSelect={() => {
                                  if (!houseId) return
                                  const notSignedUp = members.filter((m) => !shoppingItems.some((i) => i.memberId === m.id))
                                  notSignedUp.forEach((m) => {
                                    adminSignUp.mutate({ houseId, listId: list.id, memberId: m.id })
                                  })
                                }}
                                disabled={members.every((m) => shoppingItems.some((i) => i.memberId === m.id)) || adminSignUp.isPending}
                                data-checked={members.length > 0 && members.every((m) => shoppingItems.some((i) => i.memberId === m.id))}
                                className="font-medium"
                              >
                                <Users className="size-4" />
                                Selecionar todos
                              </CommandItem>
                              {members.map((m) => {
                                const isSignedUp = shoppingItems.some((i) => i.memberId === m.id)
                                return (
                                  <CommandItem
                                    key={m.id}
                                    onSelect={() => {
                                      if (isSignedUp || !houseId) return
                                      adminSignUp.mutate({ houseId, listId: list.id, memberId: m.id })
                                    }}
                                    disabled={isSignedUp && adminSignUp.isPending}
                                    data-checked={isSignedUp}
                                  >
                                    {m.fullName}
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {/* Tags of signed-up members */}
                    {shoppingItems.filter((i) => i.memberName).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {shoppingItems.filter((i) => i.memberName).map((i) => (
                          <Badge key={i.id} variant="secondary" className="text-xs gap-1">
                            <Check className="size-3" />
                            {i.memberName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleEdit} disabled={updateList.isPending || !editTitle.trim()}>
              {updateList.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {typeConfig[type].singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. Todos os itens serão removidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (!houseId) return; deleteList.mutate({ houseId, listId: list.id }, { onSuccess: () => { setDeleteAlertOpen(false); refetch() } }) }}
              disabled={deleteList.isPending}
            >
              {deleteList.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
