'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, DollarSign, Plus, HandCoins, Phone, Heart, Check, Clock, Search } from 'lucide-react'
import {
  useCampaigns,
  useQuotas,
  useCampaignContributions,
  useAssignQuota,
  usePayQuota,
  useRegisterExternalContribution,
  useUpdateContributionStatus,
} from '@/hooks/use-campaigns'
import { useAllMembers } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDate } from '@/utils'
import type { CampaignStatus, CampaignContributionItem } from '@/types'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/forms/currency-input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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

const quotaStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  partial: 'Parcial',
  paid: 'Pago',
}

const quotaStatusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'destructive',
  partial: 'outline',
  paid: 'default',
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageCampaigns'))

  const [quotaPage, setQuotaPage] = useState(1)
  const [contribPage, setContribPage] = useState(1)
  const [contribFilter, setContribFilter] = useState<'member' | 'external' | undefined>('external')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedQuotaId, setSelectedQuotaId] = useState('')
  const [selectedQuotaRemaining, setSelectedQuotaRemaining] = useState(0)

  // Assign quota form
  const [assignMemberId, setAssignMemberId] = useState('')
  const [assignAmount, setAssignAmount] = useState(0)

  // Pay quota form
  const [payAmount, setPayAmount] = useState(0)

  // External contribution form
  const [donorName, setDonorName] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [contributionAmount, setContributionAmount] = useState(0)
  const [contributionMessage, setContributionMessage] = useState('')

  const { data: campaignsData, isLoading: campaignsLoading, isError: campaignsError } = useCampaigns(1)
  const { data: quotasData, isLoading: quotasLoading } = useQuotas(campaignId, quotaPage)
  const { data: contribData, isLoading: contribLoading } = useCampaignContributions(campaignId, contribPage, contribFilter)
  const { data: membersData } = useAllMembers()

  const assignQuota = useAssignQuota()
  const payQuota = usePayQuota()
  const registerContribution = useRegisterExternalContribution()

  const campaign = campaignsData?.data?.find((c) => c.id === campaignId)
  const quotas = quotasData?.data ?? []
  const quotaTotalPages = quotasData?.pagination?.totalPages ?? 1
  const contributions = contribData?.data ?? []
  const contribTotalPages = contribData?.pagination?.totalPages ?? 1
  const members = membersData?.data ?? []

  const [contribSearch, setContribSearch] = useState('')
  const [quotaSearch, setQuotaSearch] = useState('')

  const filteredContributions = useMemo(() => {
    if (!contribSearch.trim()) return contributions
    const query = contribSearch.toLowerCase()
    return contributions.filter((c) =>
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)),
    )
  }, [contributions, contribSearch])

  const filteredQuotas = useMemo(() => {
    if (!quotaSearch.trim()) return quotas
    const query = quotaSearch.toLowerCase()
    return quotas.filter((q) =>
      q.memberName && q.memberName.toLowerCase().includes(query),
    )
  }, [quotas, quotaSearch])

  // Loading / Error states
  if (campaignsLoading) {
    return <LoadingState message="Carregando lista..." />
  }

  if (campaignsError || !campaign) {
    return (
      <ErrorState
        title="Lista não encontrada"
        message="Não foi possível carregar os dados desta lista."
      />
    )
  }

  const progressPercent =
    campaign.goalAmount > 0
      ? Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100))
      : 0

  const handleAssignQuota = () => {
    if (!houseId || !assignMemberId || !assignAmount) return
    assignQuota.mutate(
      { houseId, campaignId, memberId: assignMemberId, amount: assignAmount },
      {
        onSuccess: () => {
          setAssignDialogOpen(false)
          setAssignMemberId('')
          setAssignAmount(0)
        },
      },
    )
  }

  const handlePayQuota = () => {
    if (!houseId || !selectedQuotaId || !payAmount) return
    payQuota.mutate(
      { houseId, quotaId: selectedQuotaId, amount: payAmount },
      {
        onSuccess: () => {
          setPayDialogOpen(false)
          setSelectedQuotaId('')
          setPayAmount(0)
        },
      },
    )
  }

  const handleRegisterContribution = () => {
    if (!houseId || !donorName.trim() || !contributionAmount) return
    registerContribution.mutate(
      {
        houseId,
        campaignId,
        donorName: donorName.trim(),
        donorPhone: donorPhone.trim() || undefined,
        amount: contributionAmount,
        message: contributionMessage.trim() || undefined,
      },
      {
        onSuccess: () => {
          setDonorName('')
          setDonorPhone('')
          setContributionAmount(0)
          setContributionMessage('')
        },
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Back Button */}
      <Link href={ROUTES.ADMIN_CAMPAIGNS}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </Link>

      {/* Campaign Header */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">{campaign.title}</h1>
            <Badge variant={statusVariant[campaign.status]}>
              {statusLabel[campaign.status]}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{campaign.description}</p>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatCurrency(campaign.currentAmount)} de {formatCurrency(campaign.goalAmount)}
              </span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Inicio: {formatDate(campaign.startDate)}</span>
            {campaign.endDate && <span>Fim: {formatDate(campaign.endDate)}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="contribuicoes">
        <TabsList>
          <TabsTrigger value="contribuicoes">Contribuições</TabsTrigger>
          <TabsTrigger value="cotas">Cotas</TabsTrigger>
          <TabsTrigger value="externa">Contribuição Externa</TabsTrigger>
        </TabsList>

        {/* Contributions Tab */}
        <TabsContent value="contribuicoes">
          <div className="space-y-3">
            {/* Filter */}
            <div className="flex gap-1">
              {([
                [undefined, 'Todos'],
                ['member', 'Membros'],
                ['external', 'Externos'],
              ] as const).map(([key, label]) => (
                <Button
                  key={label}
                  variant={contribFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setContribFilter(key as typeof contribFilter); setContribPage(1) }}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={contribSearch}
                onChange={(e) => setContribSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* List */}
            {contribLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : filteredContributions.length > 0 ? (
              <div className="space-y-2">
                {filteredContributions.map((item) => (
                  <ContributionCard key={item.id} item={item} canManage={canManage} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="Nenhuma contribuição"
                description="Nenhuma contribuição registrada para esta lista."
                className="min-h-[20dvh]"
              />
            )}

            {/* Pagination */}
            {!contribLoading && contribTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={contribPage <= 1}
                  onClick={() => setContribPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {contribPage} de {contribTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={contribPage >= contribTotalPages}
                  onClick={() => setContribPage((p) => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Cotas Tab */}
        <TabsContent value="cotas">
          <div className="space-y-3">
            {/* Assign Quota Button + Dialog */}
            {canManage && <Dialog open={assignDialogOpen} onOpenChange={(open) => { setAssignDialogOpen(open); if (!open) { setAssignMemberId(''); setAssignAmount(0) } }}>
              <DialogTrigger render={<Button size="sm" className="gap-2" />}>
                <Plus className="size-4" />
                Atribuir Cota
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atribuir Cota</DialogTitle>
                  <DialogDescription>
                    Selecione o membro e o valor da cota.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Membro</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={assignMemberId}
                      onChange={(e) => setAssignMemberId(e.target.value)}
                    >
                      <option value="">Selecione um membro</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <CurrencyInput
                      value={assignAmount}
                      onValueChange={setAssignAmount}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancelar
                  </DialogClose>
                  <Button
                    onClick={handleAssignQuota}
                    disabled={assignQuota.isPending || !assignMemberId || !assignAmount}
                  >
                    {assignQuota.isPending ? 'Atribuindo...' : 'Atribuir'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={quotaSearch}
                onChange={(e) => setQuotaSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Quotas List */}
            {quotasLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : filteredQuotas.length > 0 ? (
              <div className="space-y-2">
                {filteredQuotas.map((quota) => {
                  const remaining = quota.amount - quota.paidAmount
                  return (
                    <Card key={quota.id} className="rounded-xl shadow-sm">
                      <CardContent className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Users className="size-4 shrink-0 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {quota.memberName ?? 'Membro'}
                            </span>
                            <Badge variant={quotaStatusVariant[quota.status]}>
                              {quotaStatusLabel[quota.status]}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                            <span>Valor: {formatCurrency(quota.amount)}</span>
                            <span>Pago: {formatCurrency(quota.paidAmount)}</span>
                            {remaining > 0 && (
                              <span>Restante: {formatCurrency(remaining)}</span>
                            )}
                          </div>
                        </div>

                        {canManage && quota.status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-2"
                            onClick={() => {
                              setSelectedQuotaId(quota.id)
                              setSelectedQuotaRemaining(remaining)
                              setPayAmount(0)
                              setPayDialogOpen(true)
                            }}
                          >
                            <DollarSign className="size-4" />
                            <span className="hidden sm:inline">Registrar Pagamento</span>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Nenhuma cota atribuída"
                description="Atribua cotas aos membros para acompanhar os pagamentos."
                className="min-h-[20dvh]"
              />
            )}

            {/* Quota Pagination */}
            {!quotasLoading && quotaTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={quotaPage <= 1}
                  onClick={() => setQuotaPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {quotaPage} de {quotaTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={quotaPage >= quotaTotalPages}
                  onClick={() => setQuotaPage((p) => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* External Contribution Tab */}
        <TabsContent value="externa">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HandCoins className="size-5" />
                Registrar Contribuição Externa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do doador *</label>
                <Input
                  placeholder="Nome completo"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (R$) *</label>
                <CurrencyInput
                  value={contributionAmount}
                  onValueChange={setContributionAmount}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem</label>
                <Input
                  placeholder="Mensagem opcional"
                  value={contributionMessage}
                  onChange={(e) => setContributionMessage(e.target.value)}
                />
              </div>

              <Button
                onClick={handleRegisterContribution}
                disabled={registerContribution.isPending || !donorName.trim() || !contributionAmount}
                className="gap-2"
              >
                <HandCoins className="size-4" />
                {registerContribution.isPending ? 'Registrando...' : 'Registrar Contribuição'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pay Quota Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={(open) => { setPayDialogOpen(open); if (!open) { setSelectedQuotaId(''); setPayAmount(0) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Informe o valor do pagamento. Restante: {formatCurrency(selectedQuotaRemaining)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <CurrencyInput
                value={payAmount}
                onValueChange={setPayAmount}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button
              onClick={handlePayQuota}
              disabled={payQuota.isPending || !payAmount || Number(payAmount) <= 0}
            >
              {payQuota.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ContributionCard({ item, canManage }: { item: CampaignContributionItem; canManage: boolean }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const updateStatus = useUpdateContributionStatus()
  const isMember = item.type === 'member'
  const isPaid = item.status === 'paid'

  const handleToggleStatus = () => {
    if (!houseId) return
    updateStatus.mutate({
      houseId,
      contributionId: item.id,
      isPaid: !isPaid,
    })
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="space-y-2 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {isMember ? (
                <Users className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <HandCoins className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{item.name ?? 'Anônimo'}</span>
              <Badge variant={isMember ? 'secondary' : 'outline'}>
                {isMember ? 'Membro' : 'Externo'}
              </Badge>
              {item.status && (
                <Badge variant={isPaid ? 'default' : 'destructive'}>
                  {isPaid ? 'Pago' : 'Pendente'}
                </Badge>
              )}
            </div>
            {item.phone && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-3" />
                <span>{item.phone}</span>
              </div>
            )}
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
            </div>
            {canManage && (
              <Button
                variant={isPaid ? 'outline' : 'default'}
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={updateStatus.isPending}
                onClick={handleToggleStatus}
              >
                {isPaid ? (
                  <>
                    <Clock className="size-3.5" />
                    <span className="hidden sm:inline">Pendente</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span className="hidden sm:inline">Pago</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Message */}
        {item.message && (
          <p className="text-xs italic text-muted-foreground">"{item.message}"</p>
        )}
      </CardContent>
    </Card>
  )
}
