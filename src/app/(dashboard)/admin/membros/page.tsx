'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Shield, MoreVertical, UserX, UserCheck } from 'lucide-react'
import { useMembers, useUpdateMemberPermissions, useSetMemberActive } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import { ROUTES, PERMISSION_LABELS, ROLE_LABELS } from '@/constants'
import type { MemberItem, ExtraPermission, UserRole } from '@/types'
import { MemberListItem } from '@/components/cards/member-list-item'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
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

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as ExtraPermission[]

function MemberActions({
  member,
  canEditPermissions,
  canChangeStatus,
}: {
  member: MemberItem
  canEditPermissions: boolean
  canChangeStatus: boolean
}) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const updatePermissions = useUpdateMemberPermissions()
  const setActive = useSetMemberActive()
  const [permsOpen, setPermsOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [localPerms, setLocalPerms] = useState<ExtraPermission[]>(member.extraPermissions)

  const toggle = (perm: ExtraPermission) => {
    const next = localPerms.includes(perm)
      ? localPerms.filter((p) => p !== perm)
      : [...localPerms, perm]
    setLocalPerms(next)
    if (!houseId) return
    updatePermissions.mutate({
      houseId,
      memberId: member.id,
      extraPermissions: next,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {canEditPermissions && (
            <DropdownMenuItem onClick={() => setPermsOpen(true)}>
              <Shield className="size-4" />
              Permissões
            </DropdownMenuItem>
          )}
          {canEditPermissions && canChangeStatus && <DropdownMenuSeparator />}
          {canChangeStatus && (
            member.isActive ? (
              <DropdownMenuItem variant="destructive" onClick={() => setStatusOpen(true)}>
                <UserX className="size-4" />
                Desativar membro
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setStatusOpen(true)}>
                <UserCheck className="size-4" />
                Reativar membro
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={statusOpen} onOpenChange={(open) => { setStatusOpen(open); if (!open) setReason('') }}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {member.isActive ? `Desativar ${member.fullName}?` : `Reativar ${member.fullName}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {member.isActive
                ? 'O membro perde o acesso à casa e deixa de receber mensalidades em lote e notificações. Nada é apagado: mensalidades, dívidas, pagamentos e o histórico financeiro continuam registrados e podem ser cobrados. Você pode reativar depois.'
                : 'O membro volta a acessar a casa com o mesmo cadastro, permissões e histórico.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {member.isActive && (
            <div className="space-y-1.5">
              <label htmlFor={`reason-${member.id}`} className="text-sm font-medium">Motivo (opcional)</label>
              <Textarea
                id={`reason-${member.id}`}
                rows={2}
                maxLength={280}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex.: Saiu da casa"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={setActive.isPending}
              className={member.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
              onClick={() => {
                if (!houseId) return
                setActive.mutate(
                  {
                    houseId,
                    memberId: member.id,
                    active: !member.isActive,
                    ...(member.isActive && reason.trim() ? { reason: reason.trim() } : {}),
                  },
                  { onSuccess: () => { setStatusOpen(false); setReason('') } },
                )
              }}
            >
              {setActive.isPending ? 'Salvando...' : member.isActive ? 'Desativar' : 'Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={permsOpen} onOpenChange={setPermsOpen}>
        <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Permissões de {member.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            {ALL_PERMISSIONS.map((perm) => (
              <label
                key={perm}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={localPerms.includes(perm)}
                  onCheckedChange={() => toggle(perm)}
                />
                {PERMISSION_LABELS[perm]}
              </label>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function MembersListPage() {
  const router = useRouter()
  const canManage = useAuthStore((s) => s.hasPermission('canManageMembers'))
  const isAdmin = useAuthStore((s) => s.currentHouse?.role === 'admin')
  const myUid = useAuthStore((s) => s.profile?.uid)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined)
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  // Busca feita no servidor (pagination.total já vem filtrado); debounce de 300ms
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])
  const { data, isLoading, isError, refetch } = useMembers(page, debouncedSearch || undefined, roleFilter, activeFilter)

  const members = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  const filteredMembers = useMemo(
    () => [...members].sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR')),
    [members],
  )

  const handleMemberClick = (member: MemberItem) => {
    router.push(ROUTES.MEMBER_DETAIL(member.id))
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar membros"
        message="Não foi possível carregar a lista de membros. Tente novamente."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Membros
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os membros da sua casa
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={roleFilter ?? 'all'}
          onValueChange={(v) => { setRoleFilter(v === 'all' ? undefined : v as UserRole); setPage(1) }}
          items={{ all: 'Todos os cargos', ...ROLE_LABELS }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeFilter === undefined ? 'all' : activeFilter ? 'active' : 'inactive'}
          onValueChange={(v) => { setActiveFilter(v === 'all' ? undefined : v === 'active'); setPage(1) }}
          items={{ all: 'Todos', active: 'Ativos', inactive: 'Inativos' }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members List */}
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : filteredMembers.length > 0 ? (
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <MemberListItem
              key={member.id}
              member={member}
              onClick={handleMemberClick}
              action={(() => {
                const canEditPermissions = canManage && member.role !== 'admin' && member.isActive
                // Desativar/reativar: só admin (regra do back), nunca o fundador nem a si mesmo.
                const canChangeStatus = isAdmin && !member.isOwner && member.userId !== myUid
                return canEditPermissions || canChangeStatus
                  ? <MemberActions member={member} canEditPermissions={canEditPermissions} canChangeStatus={canChangeStatus} />
                  : undefined
              })()}
            />
          ))}
        </div>
      ) : debouncedSearch ? (
        <EmptyState
          icon={Search}
          title="Nenhum resultado encontrado"
          description={`Nenhum membro encontrado para "${search}". Tente outro termo.`}
          className="min-h-[30dvh]"
        />
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum membro cadastrado"
          description="Envie convites para adicionar membros a sua casa."
          className="min-h-[30dvh]"
        />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
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
