'use client'

import { useMemo, useState } from 'react'
import { Plus, HandCoins, Check, X, Ban, Banknote, Search, Home as HomeIcon, ArrowRight } from 'lucide-react'
import {
  useMemberCharges,
  useCreateMemberCharge,
  useAcceptMemberCharge,
  useRejectMemberCharge,
  usePayMemberCharge,
  useCancelMemberCharge,
} from '@/hooks/use-member-charges'
import { useAllMembers } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils'
import { formatDateTime } from '@/utils/dates'
import type {
  MemberCharge,
  MemberChargeCategory,
  MemberChargePaymentMethod,
  MemberChargeStatus,
} from '@/types'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { CurrencyInput } from '@/components/forms/currency-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ViewFilter = 'received' | 'created' | 'house'

const STATUS_LABELS: Record<MemberChargeStatus, string> = {
  pending: 'Aguardando validação',
  accepted: 'Validada · a pagar',
  rejected: 'Rejeitada',
  paid: 'Paga',
  cancelled: 'Cancelada',
}

const STATUS_VARIANTS: Record<MemberChargeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  accepted: 'default',
  rejected: 'destructive',
  paid: 'secondary',
  cancelled: 'secondary',
}

const CATEGORY_LABELS: Record<MemberChargeCategory, string> = {
  purchase: 'Compra',
  loan: 'Empréstimo',
  service: 'Serviço',
  shared_expense: 'Despesa dividida',
  other: 'Outro',
}

const PAYMENT_LABELS: Record<MemberChargePaymentMethod, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  card: 'Cartão',
  transfer: 'Transferência',
  internal: 'Acerto interno',
  other: 'Outro',
}

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

interface Perms {
  myMemberId: string | undefined
  isCashier: boolean
}

/** Mesmas regras do back (memberCharges.service): quem valida, quem confirma pagamento, quem cancela. */
function canValidate(c: MemberCharge, p: Perms) {
  if (c.status !== 'pending') return false
  if (c.targetType === 'member') return c.targetMemberId === p.myMemberId
  return p.isCashier && c.creatorMemberId !== p.myMemberId
}

function canConfirmPayment(c: MemberCharge, p: Perms) {
  if (c.status !== 'accepted') return false
  if (c.targetType === 'house') return p.isCashier && c.creatorMemberId !== p.myMemberId
  if (c.creatorMemberId === p.myMemberId) return true
  return p.isCashier && c.targetMemberId !== p.myMemberId
}

function canCancel(c: MemberCharge, p: Perms) {
  if (c.status !== 'pending' && c.status !== 'accepted') return false
  const isCreator = c.creatorMemberId === p.myMemberId
  const isDebtor = c.targetType === 'member' && c.targetMemberId === p.myMemberId
  return isCreator || (p.isCashier && !isDebtor)
}

export function MemberChargesContent() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const myMemberId = useAuthStore((s) => s.currentHouse?.memberId)
  const isCashier = useAuthStore((s) => s.hasPermission('canManageCashier'))
  const perms: Perms = { myMemberId, isCashier }

  const [view, setView] = useState<ViewFilter>('received')
  const [status, setStatus] = useState<'all' | MemberChargeStatus>('all')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useMemberCharges(view, status, page)
  const charges = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  const [createOpen, setCreateOpen] = useState(false)
  const [rejecting, setRejecting] = useState<MemberCharge | null>(null)
  const [paying, setPaying] = useState<MemberCharge | null>(null)
  const [cancelling, setCancelling] = useState<MemberCharge | null>(null)

  const accept = useAcceptMemberCharge()

  const changeView = (v: string) => {
    setView(v as ViewFilter)
    setPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Cobranças</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cobre outro filho da casa ou peça reembolso à casa
          </p>
        </div>
        <Button size="sm" className="shrink-0 gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Nova cobrança
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={changeView}>
          <TabsList>
            <TabsTrigger value="received">Recebidas</TabsTrigger>
            <TabsTrigger value="created">Enviadas</TabsTrigger>
            <TabsTrigger value="house">Contra a casa</TabsTrigger>
          </TabsList>
        </Tabs>
        <select
          aria-label="Filtrar por status"
          className={`${SELECT_CLASS} sm:w-56`}
          value={status}
          onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1) }}
        >
          <option value="all">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as MemberChargeStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {view === 'house' && (
        <p className="text-xs text-muted-foreground">
          {isCashier
            ? 'Você é do caixa: valida e paga reembolsos de outros membros (não os que você mesmo criou).'
            : 'Seus pedidos de reembolso à casa. Quem valida e paga é o caixa.'}
        </p>
      )}

      {isError ? (
        <ErrorState title="Erro ao carregar cobranças" message="Tente novamente." onRetry={() => refetch()} />
      ) : isLoading ? (
        <ListSkeleton rows={4} />
      ) : charges.length > 0 ? (
        <div className="space-y-2">
          {charges.map((c) => (
            <Card key={c.id} data-testid="charge-card">
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{c.description}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      <span>{c.creatorName}</span>
                      <ArrowRight className="size-3" aria-label="cobra de" />
                      {c.targetType === 'house' ? (
                        <span className="flex items-center gap-1"><HomeIcon className="size-3" />Casa</span>
                      ) : (
                        <span>{c.targetName ?? 'Membro'}</span>
                      )}
                      <span>· {CATEGORY_LABELS[c.category] ?? c.category}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{formatCurrency(c.amount)}</p>
                    <Badge variant={STATUS_VARIANTS[c.status]} className="mt-1">{STATUS_LABELS[c.status]}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Criada em {formatDateTime(c.createdAt)}</span>
                  {c.paidAt && (
                    <span>
                      Paga em {formatDateTime(c.paidAt)}
                      {c.paymentMethod ? ` · ${PAYMENT_LABELS[c.paymentMethod as MemberChargePaymentMethod] ?? c.paymentMethod}` : ''}
                    </span>
                  )}
                  {c.rejectedAt && <span>Rejeitada em {formatDateTime(c.rejectedAt)}</span>}
                </div>
                {c.rejectionReason && (
                  <p className="rounded-md bg-muted px-2 py-1.5 text-xs">Motivo: {c.rejectionReason}</p>
                )}
                {(canValidate(c, perms) || canConfirmPayment(c, perms) || canCancel(c, perms)) && (
                  <div className="flex flex-wrap justify-end gap-2 pt-1">
                    {canCancel(c, perms) && (
                      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setCancelling(c)}>
                        <Ban className="size-4" />
                        Cancelar
                      </Button>
                    )}
                    {canValidate(c, perms) && (
                      <>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRejecting(c)}>
                          <X className="size-4" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          disabled={accept.isPending || !houseId}
                          onClick={() => houseId && accept.mutate({ houseId, chargeId: c.id })}
                        >
                          <Check className="size-4" />
                          Aceitar
                        </Button>
                      </>
                    )}
                    {canConfirmPayment(c, perms) && (
                      <Button size="sm" className="gap-1.5" onClick={() => setPaying(c)}>
                        <Banknote className="size-4" />
                        {c.targetType === 'house' ? 'Registrar pagamento da casa' : 'Confirmar recebimento'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HandCoins}
          title="Nenhuma cobrança"
          description={
            view === 'received'
              ? 'Ninguém te cobrou nada.'
              : view === 'created'
                ? 'Você ainda não criou cobranças.'
                : 'Nenhum pedido de reembolso à casa.'
          }
          className="min-h-[30dvh]"
        />
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <span className="text-sm text-muted-foreground">{page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
        </div>
      )}

      <CreateChargeDialog open={createOpen} onOpenChange={setCreateOpen} myMemberId={myMemberId} />
      <RejectDialog charge={rejecting} onClose={() => setRejecting(null)} />
      <PayDialog charge={paying} onClose={() => setPaying(null)} />
      <CancelDialog charge={cancelling} onClose={() => setCancelling(null)} />
    </div>
  )
}

function CreateChargeDialog({
  open,
  onOpenChange,
  myMemberId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  myMemberId: string | undefined
}) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const create = useCreateMemberCharge()
  const { data: membersData, isLoading: loadingMembers } = useAllMembers()
  const [targetType, setTargetType] = useState<'member' | 'house'>('member')
  const [targets, setTargets] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [category, setCategory] = useState<MemberChargeCategory>('purchase')
  const [search, setSearch] = useState('')

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (membersData?.data ?? [])
      .filter((m) => m.isActive && m.id !== myMemberId)
      .filter((m) => !term || m.fullName.toLowerCase().includes(term))
  }, [membersData, myMemberId, search])

  const reset = () => {
    setTargetType('member')
    setTargets([])
    setDescription('')
    setAmount(0)
    setCategory('purchase')
    setSearch('')
  }

  const descOk = description.trim().length >= 3 && description.trim().length <= 200
  const valid = descOk && amount > 0 && (targetType === 'house' || targets.length > 0)

  const handleCreate = () => {
    if (!houseId || !valid) return
    create.mutate(
      {
        houseId,
        targetType,
        targetMemberIds: targetType === 'member' ? targets : [],
        description: description.trim(),
        amount,
        category,
      },
      { onSuccess: () => { reset(); onOpenChange(false) } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova cobrança</DialogTitle>
          <DialogDescription>
            {targetType === 'member'
              ? 'Cada pessoa escolhida recebe uma cobrança e precisa aceitar antes de pagar.'
              : 'O caixa da casa valida e registra o reembolso (vira despesa da casa).'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <RadioGroup value={targetType} onValueChange={(v) => setTargetType(v as 'member' | 'house')} className="grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm">
              <RadioGroupItem value="member" />
              Filhos da casa
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm">
              <RadioGroupItem value="house" />
              A casa
            </label>
          </RadioGroup>

          {targetType === 'member' && (
            <div className="space-y-2 rounded-lg border p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar membro" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="max-h-44 overflow-y-auto">
                {loadingMembers ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">Carregando...</p>
                ) : candidates.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">Nenhum membro encontrado</p>
                ) : (
                  candidates.map((m) => (
                    <label key={m.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                      <Checkbox
                        checked={targets.includes(m.id)}
                        onCheckedChange={() =>
                          setTargets((prev) => (prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]))
                        }
                      />
                      <span className="truncate">{m.fullName}</span>
                    </label>
                  ))
                )}
              </div>
              {targets.length > 0 && (
                <p className="px-1 text-xs text-muted-foreground">{targets.length} selecionado{targets.length === 1 ? '' : 's'}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="charge-description" className="text-sm font-medium">Descrição *</label>
            <Input
              id="charge-description"
              placeholder="Ex.: Charuto da gira"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {description && !descOk && <p className="text-xs text-destructive">Use de 3 a 200 caracteres</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="charge-amount" className="text-sm font-medium">Valor *</label>
              <CurrencyInput id="charge-amount" value={amount} onValueChange={setAmount} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="charge-category" className="text-sm font-medium">Tipo</label>
              <select
                id="charge-category"
                className={SELECT_CLASS}
                value={category}
                onChange={(e) => setCategory(e.target.value as MemberChargeCategory)}
              >
                {(Object.keys(CATEGORY_LABELS) as MemberChargeCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={handleCreate} disabled={!valid || create.isPending}>
            {create.isPending
              ? 'Criando...'
              : targetType === 'member' && targets.length > 1
                ? `Criar ${targets.length} cobranças`
                : 'Criar cobrança'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RejectDialog({ charge, onClose }: { charge: MemberCharge | null; onClose: () => void }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const reject = useRejectMemberCharge()
  const [reason, setReason] = useState('')
  return (
    <Dialog open={!!charge} onOpenChange={(v) => { if (!v) { onClose(); setReason('') } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeitar cobrança?</DialogTitle>
          <DialogDescription>
            {charge && `${charge.description} · ${formatCurrency(charge.amount)}. A rejeição fica registrada e não pode ser desfeita.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <label htmlFor="reject-reason" className="text-sm font-medium">Motivo (opcional)</label>
          <Textarea id="reject-reason" rows={2} maxLength={280} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Voltar</DialogClose>
          <Button
            variant="destructive"
            disabled={reject.isPending}
            onClick={() => {
              if (!houseId || !charge) return
              reject.mutate(
                { houseId, chargeId: charge.id, ...(reason.trim() ? { reason: reason.trim() } : {}) },
                { onSuccess: () => { onClose(); setReason('') } },
              )
            }}
          >
            {reject.isPending ? 'Rejeitando...' : 'Rejeitar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PayDialog({ charge, onClose }: { charge: MemberCharge | null; onClose: () => void }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const pay = usePayMemberCharge()
  const [method, setMethod] = useState<MemberChargePaymentMethod>('pix')
  const isHouse = charge?.targetType === 'house'
  return (
    <Dialog open={!!charge} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isHouse ? 'Registrar pagamento da casa' : 'Confirmar recebimento'}</DialogTitle>
          <DialogDescription>
            {charge && (isHouse
              ? `A casa paga ${formatCurrency(charge.amount)} a ${charge.creatorName}. Isso lança uma despesa no caixa.`
              : `${charge.targetName ?? 'O membro'} pagou ${formatCurrency(charge.amount)} a ${charge.creatorName}.`)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <label htmlFor="charge-pay-method" className="text-sm font-medium">Forma de pagamento</label>
          <select
            id="charge-pay-method"
            className={SELECT_CLASS}
            value={method}
            onChange={(e) => setMethod(e.target.value as MemberChargePaymentMethod)}
          >
            {(Object.keys(PAYMENT_LABELS) as MemberChargePaymentMethod[]).map((m) => (
              <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Voltar</DialogClose>
          <Button
            disabled={pay.isPending}
            onClick={() => {
              if (!houseId || !charge) return
              pay.mutate({ houseId, chargeId: charge.id, paymentMethod: method }, { onSuccess: onClose })
            }}
          >
            {pay.isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelDialog({ charge, onClose }: { charge: MemberCharge | null; onClose: () => void }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const cancel = useCancelMemberCharge()
  return (
    <Dialog open={!!charge} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar cobrança?</DialogTitle>
          <DialogDescription>
            {charge && `${charge.description} · ${formatCurrency(charge.amount)}. A cobrança fica como cancelada e não pode ser paga depois.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Voltar</DialogClose>
          <Button
            variant="destructive"
            disabled={cancel.isPending}
            onClick={() => {
              if (!houseId || !charge) return
              cancel.mutate({ houseId, chargeId: charge.id }, { onSuccess: onClose })
            }}
          >
            {cancel.isPending ? 'Cancelando...' : 'Cancelar cobrança'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
