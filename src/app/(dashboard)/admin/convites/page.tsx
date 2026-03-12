'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  Copy,
  Ban,
  Check,
  Clock,
  XCircle,
  UserPlus,
  MoreVertical,
  Search,
} from 'lucide-react'
import { useInvites, useCreateInvite, useRevokeInvite } from '@/hooks/use-invites'
import { useAuthStore } from '@/stores/auth'
import { INVITE_STATUS_LABELS, INVITE_TYPE_LABELS } from '@/constants'
import { formatDateTime } from '@/utils'
import type { InviteType, InviteStatus } from '@/types'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const INVITE_LINKS_STORAGE_KEY = 'sagrada:invite-links'

function saveInviteLink(inviteId: string, link: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(INVITE_LINKS_STORAGE_KEY) || '{}')
    stored[inviteId] = link
    localStorage.setItem(INVITE_LINKS_STORAGE_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }
}

function getInviteLink(inviteId: string): string | null {
  try {
    const stored = JSON.parse(localStorage.getItem(INVITE_LINKS_STORAGE_KEY) || '{}')
    return stored[inviteId] ?? null
  } catch {
    return null
  }
}

const statusIcon: Record<InviteStatus, React.ElementType> = {
  active: Clock,
  used: Check,
  expired: XCircle,
  revoked: Ban,
}

const statusVariant: Record<InviteStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'secondary',
  used: 'default',
  expired: 'outline',
  revoked: 'destructive',
}

export default function InvitesPage() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteType, setInviteType] = useState<InviteType>('member')
  const [maxUses, setMaxUses] = useState('1')
  const [expiresInHours, setExpiresInHours] = useState('168')
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  const [revokeAlertOpen, setRevokeAlertOpen] = useState(false)
  const [revokeInviteId, setRevokeInviteId] = useState<string | null>(null)

  const houseId = useAuthStore((s) => s.currentHouseId())

  const { data, isLoading, isError, refetch } = useInvites(page)
  const createInvite = useCreateInvite()
  const revokeInvite = useRevokeInvite()

  const invites = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  const [filterStatus, setFilterStatus] = useState<InviteStatus | 'all'>('all')

  const filteredInvites = useMemo(() => {
    if (filterStatus === 'all') return invites
    return invites.filter((i) => i.status === filterStatus)
  }, [invites, filterStatus])

  const handleCreateInvite = () => {
    if (!houseId) return
    createInvite.mutate(
      {
        houseId,
        inviteType,
        maxUses: Number(maxUses) || 1,
        expiresInHours: Number(expiresInHours) || 168,
      },
      {
        onSuccess: (data) => {
          const link = `${window.location.origin}${data.invitePath}`
          setCreatedLink(link)
          saveInviteLink(data.inviteId, link)
        },
      },
    )
  }

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setCreatedLink(null)
      setInviteType('member')
      setMaxUses('1')
      setExpiresInHours('168')
    }
  }

  const handleCopyCreatedLink = () => {
    if (!createdLink) return
    navigator.clipboard.writeText(createdLink)
    toast.success('Link copiado!')
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar convites"
        message="Não foi possível carregar a lista de convites. Tente novamente."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Convites
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os convites de novos membros
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger
            render={<Button size="sm" className="shrink-0 gap-2" />}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo Convite</span>
          </DialogTrigger>

          <DialogContent>
            {createdLink ? (
              <>
                <DialogHeader>
                  <DialogTitle>Convite Criado</DialogTitle>
                  <DialogDescription>
                    Copie o link abaixo e envie para o convidado.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={createdLink}
                      className="text-xs"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0"
                      onClick={handleCopyCreatedLink}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este link só pode ser visualizado agora. Salve-o antes de fechar.
                  </p>
                </div>

                <DialogFooter>
                  <Button onClick={() => handleCloseDialog(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Criar Novo Convite</DialogTitle>
                  <DialogDescription>
                    Selecione o tipo de convite.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Convite</label>
                    <Select
                      value={inviteType}
                      onValueChange={(val) => setInviteType(val as InviteType)}
                      items={INVITE_TYPE_LABELS}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          {INVITE_TYPE_LABELS.member}
                        </SelectItem>
                        <SelectItem value="admin">
                          {INVITE_TYPE_LABELS.admin}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {inviteType === 'member' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Máximo de usos</label>
                        <Input
                          type="number"
                          min="1"
                          value={maxUses}
                          onChange={(e) => setMaxUses(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Quantas pessoas podem usar este convite
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Expira em</label>
                        <Select
                          value={expiresInHours}
                          onValueChange={(v) => v && setExpiresInHours(v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">1 dia</SelectItem>
                            <SelectItem value="72">3 dias</SelectItem>
                            <SelectItem value="168">7 dias</SelectItem>
                            <SelectItem value="720">30 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancelar
                  </DialogClose>
                  <Button
                    onClick={handleCreateInvite}
                    disabled={createInvite.isPending}
                  >
                    {createInvite.isPending ? 'Criando...' : 'Criar Convite'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select
          value={filterStatus}
          onValueChange={(v) => {
            setFilterStatus(v as InviteStatus | 'all')
            setPage(1)
          }}
          items={{ all: 'Todos os status', ...INVITE_STATUS_LABELS }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">{INVITE_STATUS_LABELS.active}</SelectItem>
            <SelectItem value="used">{INVITE_STATUS_LABELS.used}</SelectItem>
            <SelectItem value="expired">{INVITE_STATUS_LABELS.expired}</SelectItem>
            <SelectItem value="revoked">{INVITE_STATUS_LABELS.revoked}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invites List */}
      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : filteredInvites.length > 0 ? (
        <div className="space-y-2">
          {filteredInvites.map((invite) => {
            const StatusIcon = statusIcon[invite.status]
            const variant = statusVariant[invite.status]

            return (
              <Card key={invite.id} className="rounded-xl shadow-sm">
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={variant} className="gap-1">
                          <StatusIcon className="size-3" />
                          {INVITE_STATUS_LABELS[invite.status]}
                        </Badge>
                        <Badge variant="outline">
                          {INVITE_TYPE_LABELS[invite.inviteType] ?? invite.inviteType}
                        </Badge>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Criado em {formatDateTime(invite.createdAt)}
                        </span>
                        <span>
                          Expira em {formatDateTime(invite.expiresAt)}
                        </span>
                      </div>
                    </div>

                    {invite.status === 'active' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="size-8 shrink-0" />
                          }
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              const link = getInviteLink(invite.id)
                              if (link) {
                                navigator.clipboard.writeText(link)
                                toast.success('Link copiado!')
                              } else {
                                toast.info('Link não disponível. Crie um novo convite para obter o link.')
                              }
                            }}
                          >
                            <Copy className="size-4" />
                            Copiar link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setRevokeInviteId(invite.id)
                              setRevokeAlertOpen(true)
                            }}
                          >
                            <Ban className="size-4" />
                            Revogar convite
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={UserPlus}
          title="Nenhum convite criado"
          description="Crie convites para adicionar novos membros a sua casa."
          action={{
            label: 'Criar Convite',
            onClick: () => setDialogOpen(true),
          }}
        />
      )}

      {/* Revoke Alert Dialog */}
      <AlertDialog open={revokeAlertOpen} onOpenChange={setRevokeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revogar convite?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja revogar este convite? O
              link deixará de funcionar e esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokeInviteId) {
                  revokeInvite.mutate({ houseId: houseId!, inviteId: revokeInviteId })
                }
                setRevokeAlertOpen(false)
                setRevokeInviteId(null)
              }}
              disabled={revokeInvite.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeInvite.isPending
                ? 'Revogando...'
                : 'Revogar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
