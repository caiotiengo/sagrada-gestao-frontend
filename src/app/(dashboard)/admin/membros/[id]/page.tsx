'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Droplets,
  ShieldCheck,
  UserCog,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  ListChecks,
  Store,
  ShoppingCart,
  Briefcase,
} from 'lucide-react'
import { useMember } from '@/hooks/use-members'
import { useLegacyMemberFinancialSummary } from '@/hooks/use-finance'
import { useAuthStore } from '@/stores/auth'
import { ROUTES, ROLE_LABELS } from '@/constants'
import { formatCPF, formatPhone, formatDate, formatCurrency, getInitials } from '@/utils'
import { LoadingState } from '@/components/feedback/loading-state'
import { ErrorState } from '@/components/feedback/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { membersService } from '@/services/members'
import { toast } from 'sonner'

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const memberId = params.id as string
  const houseId = useAuthStore((s) => s.currentHouseId())
  const { data: member, isLoading, isError, refetch } = useMember(memberId)
  const { data: financialSummary, isLoading: isLoadingFinancial } = useLegacyMemberFinancialSummary(memberId)

  const isCaixa = member?.extraPermissions.includes('canManageCashier') ?? false

  const toggleCaixa = useMutation({
    mutationFn: () => {
      if (!houseId) throw new Error('No house selected')
      const newPermissions = isCaixa
        ? member!.extraPermissions.filter((p) => p !== 'canManageCashier')
        : [...(member?.extraPermissions ?? []), 'canManageCashier' as const]
      return membersService.updateMemberPermissions({
        houseId,
        memberId,
        extraPermissions: newPermissions,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', memberId] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(
        isCaixa
          ? 'Permissão de caixa removida'
          : 'Permissão de caixa concedida',
      )
    },
    onError: () => {
      toast.error('Erro ao alterar permissão de caixa')
    },
  })

  if (isLoading) {
    return <LoadingState message="Carregando dados do membro..." />
  }

  if (isError || !member) {
    return (
      <ErrorState
        title="Erro ao carregar membro"
        message="Não foi possível carregar os dados deste membro."
        onRetry={() => refetch()}
      />
    )
  }

  const roleLabel = ROLE_LABELS[member.role] ?? member.role

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(ROUTES.MEMBERS_LIST)}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Button>

      {/* Member Header */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="flex items-center gap-4 py-4">
          <Avatar size="lg">
            {member.user.photoUrl && (
              <AvatarImage src={member.user.photoUrl} alt={member.user.fullName} />
            )}
            <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight">
              {member.user.fullName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={member.isActive ? 'default' : 'secondary'}>
                {member.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
              <Badge variant="outline">{roleLabel}</Badge>
              {isCaixa && (
                <Badge variant="secondary">Caixa</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      {!isLoadingFinancial && financialSummary && financialSummary.totals.totalOwed > 0 && (
        <Card className="rounded-xl border-amber-200 shadow-sm dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="size-5" />
              Pendências Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(financialSummary.totals.totalOwed)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {financialSummary.totals.pendingFeesTotal > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  <AlertCircle className="size-3" />
                  Mensalidades: {formatCurrency(financialSummary.totals.pendingFeesTotal)}
                </Badge>
              )}
              {financialSummary.totals.totalDebt > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  <TrendingDown className="size-3" />
                  Débitos: {formatCurrency(financialSummary.totals.totalDebt)}
                </Badge>
              )}
              {financialSummary.totals.storeTabTotal > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  <Store className="size-3" />
                  Loja: {formatCurrency(financialSummary.totals.storeTabTotal)}
                </Badge>
              )}
              {financialSummary.totals.totalQuotasPending > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  <ListChecks className="size-3" />
                  Cotas: {formatCurrency(financialSummary.totals.totalQuotasPending)}
                </Badge>
              )}
              {financialSummary.totals.totalShoppingPending > 0 && (
                <Badge variant="outline" className="gap-1.5">
                  <Briefcase className="size-3" />
                  Trabalhos/Jogos: {formatCurrency(financialSummary.totals.totalShoppingPending)}
                </Badge>
              )}
            </div>

            {/* Pending quotas detail */}
            {financialSummary.quotas.filter((q) => q.status !== 'paid').length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cotas pendentes
                </p>
                {financialSummary.quotas
                  .filter((q) => q.status !== 'paid')
                  .map((quota) => (
                    <div
                      key={quota.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <ListChecks className="size-4 text-pink-500" />
                        <div>
                          <p className="text-sm font-medium">{quota.campaignName || 'Lista'}</p>
                          <p className="text-xs text-muted-foreground">
                            {quota.status === 'partial' ? 'Parcial' : 'Pendente'} · Pago {formatCurrency(quota.paidAmount)} de {formatCurrency(quota.amount)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                        -{formatCurrency(quota.amount - quota.paidAmount)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Pending shopping debts detail */}
            {(financialSummary.shoppingDebts ?? []).length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trabalhos / Jogos pendentes
                </p>
                {(financialSummary.shoppingDebts ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium">{item.listTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.listType === 'game' ? 'Jogo' : item.listType === 'job' ? 'Trabalho' : 'Lista'} · Pendente
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      -{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="truncate text-sm">{member.user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm">{formatPhone(member.user.phone)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <CreditCard className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="text-sm">{formatCPF(member.mediumProfile?.cpf ?? '')}</p>
            </div>
          </div>

          {member.mediumProfile?.rg && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">RG</p>
                  <p className="text-sm">{member.mediumProfile.rg}</p>
                </div>
              </div>
            </>
          )}

          {member.mediumProfile?.bloodType && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <Droplets className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    Tipo Sanguineo
                  </p>
                  <p className="text-sm">{member.mediumProfile.bloodType}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {(member.mediumProfile?.emergencyContactName || member.mediumProfile?.emergencyContactPhone) && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Contato de Emergencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {member.mediumProfile?.emergencyContactName && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm">{member.mediumProfile.emergencyContactName}</p>
                </div>
              </div>
            )}

            {member.mediumProfile?.emergencyContactPhone && (
              <>
                {member.mediumProfile?.emergencyContactName && <Separator />}
                <div className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm">
                      {formatPhone(member.mediumProfile.emergencyContactPhone)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Cargo</p>
              <p className="text-sm">{roleLabel}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <UserCog className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Membro desde</p>
              <p className="text-sm">{formatDate(member.joinedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="outline" className="flex-1" />
            }
          >
            {isCaixa ? 'Remover Caixa' : 'Tornar Caixa'}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isCaixa
                  ? 'Remover permissão de caixa?'
                  : 'Conceder permissão de caixa?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isCaixa
                  ? `Tem certeza que deseja remover a permissão de caixa de ${member.user.fullName}?`
                  : `Tem certeza que deseja conceder permissão de caixa a ${member.user.fullName}?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => toggleCaixa.mutate()}
                disabled={toggleCaixa.isPending}
              >
                {toggleCaixa.isPending ? 'Processando...' : 'Confirmar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
