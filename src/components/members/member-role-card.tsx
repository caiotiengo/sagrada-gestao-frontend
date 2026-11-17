'use client'

import { useState } from 'react'
import { Crown, ShieldCheck, UserRound } from 'lucide-react'
import type { ExtraPermission, MemberDetails } from '@/types'
import {
  LEADERSHIP_WARNING,
  OWNER_LABEL,
  PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from '@/constants'
import { useAuthStore } from '@/stores/auth'
import {
  useChangeMemberRole,
  useMember,
  useTransferHouseOwnership,
  useUpdateMemberPermissions,
} from '@/hooks/use-members'
import { PermissionsEditor } from '@/components/members/permissions-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

type Pending = 'promote' | 'demote' | 'transfer' | null

/**
 * Papel na casa (Liderança/Membro), titularidade e permissões de um membro.
 * Só a Liderança muda alguma coisa; quem cuida dos membros só vê.
 */
export function MemberRoleCard({ member }: { member: MemberDetails }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const isAdmin = useAuthStore((s) => s.currentHouse?.role === 'admin')
  const myMemberId = useAuthStore((s) => s.currentMemberId())
  const { data: me } = useMember(isAdmin && myMemberId ? myMemberId : '')
  const changeRole = useChangeMemberRole()
  const transfer = useTransferHouseOwnership()
  const updatePermissions = useUpdateMemberPermissions()
  const [pending, setPending] = useState<Pending>(null)
  const [draft, setDraft] = useState<ExtraPermission[] | null>(null)

  const name = member.user.fullName
  const firstName = name.split(' ')[0] || name
  const isSelf = member.id === myMemberId
  const isLeader = member.role === 'admin'
  const iAmOwner = !!me?.isOwner
  const perms = draft ?? member.extraPermissions ?? []
  const dirty = draft !== null

  const run = () => {
    if (!houseId || !pending) return
    const close = { onSettled: () => setPending(null) }
    if (pending === 'transfer') {
      transfer.mutate({ houseId, memberId: member.id }, close)
    } else {
      changeRole.mutate(
        { houseId, memberId: member.id, role: pending === 'promote' ? 'admin' : 'filho_de_santo' },
        { ...close, onSuccess: () => setDraft(null) },
      )
    }
  }

  const dialog = {
    promote: {
      title: `Tornar ${name} Liderança?`,
      body: `${LEADERSHIP_WARNING} ${firstName} vai poder dar baixa em mensalidades, mexer no caixa, ver os dados de todos os membros, convidar pessoas e mudar o papel de qualquer um. Liderança não paga mensalidade. Dá para desfazer depois.`,
      action: 'Tornar Liderança',
    },
    demote: {
      title: isSelf ? 'Sair da Liderança?' : `Tirar ${name} da Liderança?`,
      body: isSelf
        ? 'Você volta a ser Membro e perde, na hora, o acesso ao que é só da Liderança (dinheiro, convites, papéis). Para voltar, outra pessoa da Liderança precisa te promover.'
        : `${firstName} volta a ser Membro e perde, na hora, o acesso ao que é só da Liderança. As permissões que tinha antes de entrar na Liderança voltam; dá para ajustar depois aqui mesmo.`,
      action: isSelf ? 'Sair da Liderança' : 'Tornar Membro',
    },
    transfer: {
      title: `Passar a titularidade para ${name}?`,
      body: `${firstName} passa a ser ${OWNER_LABEL.toLowerCase()} da casa. Você continua na Liderança e, se quiser, pode sair dela depois. Só a pessoa titular passa a titularidade adiante.`,
      action: 'Passar a titularidade',
    },
  }

  return (
    <>
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Papel na casa</CardTitle>
          <CardDescription>O que {isSelf ? 'você vê' : `${firstName} vê`} e pode fazer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            {isLeader ? (
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            ) : (
              <UserRound className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold" data-testid="member-role">{ROLE_LABELS[member.role] ?? member.role}</p>
                {member.isOwner && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="size-3" />
                    {OWNER_LABEL}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[member.role]}</p>
            </div>
          </div>

          {isAdmin && !member.isActive && (
            <p className="text-sm text-muted-foreground">Reative a pessoa para mudar o papel dela.</p>
          )}

          {isAdmin && member.isActive && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!isLeader && (
                <Button onClick={() => setPending('promote')}>Tornar Liderança</Button>
              )}
              {isLeader && !member.isOwner && (
                <Button variant="outline" onClick={() => setPending('demote')}>
                  {isSelf ? 'Sair da Liderança' : 'Tornar Membro'}
                </Button>
              )}
              {isLeader && !member.isOwner && iAmOwner && !isSelf && (
                <Button variant="outline" onClick={() => setPending('transfer')}>
                  <Crown className="size-4" />
                  Passar a titularidade
                </Button>
              )}
            </div>
          )}

          {isAdmin && member.isActive && member.isOwner && (
            <p className="text-xs text-muted-foreground">
              {isSelf
                ? 'Você é titular da casa. Para sair da Liderança, primeiro torne outra pessoa Liderança e passe a titularidade para ela (no perfil dela).'
                : `${firstName} é titular da casa. Para sair da Liderança, precisa antes passar a titularidade para outra pessoa da Liderança.`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Permissões</CardTitle>
          <CardDescription>
            {isLeader
              ? 'Liderança já pode tudo. Não precisa marcar nada.'
              : 'Além do básico de Membro, o que esta pessoa também cuida na casa.'}
          </CardDescription>
        </CardHeader>
        {!isLeader && (
          <CardContent className="space-y-4">
            {isAdmin && member.isActive ? (
              <>
                <PermissionsEditor value={perms} onChange={setDraft} idPrefix={`detail-${member.id}`} />
                <div className="flex gap-2">
                  <Button
                    disabled={!dirty || updatePermissions.isPending}
                    onClick={() => {
                      if (!houseId || !draft) return
                      updatePermissions.mutate(
                        { houseId, memberId: member.id, extraPermissions: draft },
                        { onSuccess: () => setDraft(null) },
                      )
                    }}
                  >
                    {updatePermissions.isPending ? 'Salvando...' : 'Salvar permissões'}
                  </Button>
                  {dirty && (
                    <Button variant="ghost" onClick={() => setDraft(null)}>
                      Desfazer
                    </Button>
                  )}
                </div>
              </>
            ) : perms.length > 0 ? (
              <ul className="space-y-2">
                {PERMISSIONS.filter((p) => perms.includes(p.key)).map((p) => (
                  <li key={p.key}>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma permissão extra.</p>
            )}
          </CardContent>
        )}
      </Card>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          {pending && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{dialog[pending].title}</AlertDialogTitle>
                <AlertDialogDescription>{dialog[pending].body}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={run}
                  disabled={changeRole.isPending || transfer.isPending}
                >
                  {changeRole.isPending || transfer.isPending ? 'Salvando...' : dialog[pending].action}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
