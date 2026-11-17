'use client'

import { useMemo, useState } from 'react'
import { Send, Search } from 'lucide-react'
import { useSendNotification } from '@/hooks/use-notifications'
import { useAllMembers } from '@/hooks/use-members'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ErrorState } from '@/components/feedback/error-state'
import type { SendNotificationRequest } from '@/types'

const TITLE_MAX = 120
const BODY_MAX = 2000

type Audience = 'all' | 'filho_de_santo' | 'admin' | 'selected'

const AUDIENCE_LABELS: Record<Audience, string> = {
  all: 'Todos os membros ativos',
  filho_de_santo: 'Só Membros',
  admin: 'Só a Liderança',
  selected: 'Escolher membros',
}

export default function AdminNotificationsPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const isAdmin = useAuthStore((s) => s.currentHouse?.role === 'admin')
  const send = useSendNotification()
  const { data: membersData, isLoading: loadingMembers, isError, refetch } = useAllMembers()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<Audience>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const activeMembers = useMemo(
    () => (membersData?.data ?? []).filter((m) => m.isActive),
    [membersData],
  )
  const visibleMembers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term ? activeMembers.filter((m) => m.fullName.toLowerCase().includes(term)) : activeMembers
  }, [activeMembers, search])

  const recipients =
    audience === 'all'
      ? activeMembers.length
      : audience === 'selected'
        ? selected.length
        : activeMembers.filter((m) => m.role === audience).length

  const valid =
    title.trim().length > 0 &&
    title.trim().length <= TITLE_MAX &&
    body.trim().length > 0 &&
    body.length <= BODY_MAX &&
    (audience !== 'selected' || selected.length > 0)

  const toggleMember = (userId: string) =>
    setSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))

  const handleSend = () => {
    if (!houseId || !valid) return
    const payload: SendNotificationRequest = {
      houseId,
      title: title.trim(),
      body: body.trim(),
      type: 'general',
      ...(audience === 'selected' ? { targetUserIds: selected } : {}),
      ...(audience === 'admin' || audience === 'filho_de_santo' ? { targetRole: audience } : {}),
    }
    send.mutate(payload, {
      onSuccess: () => {
        setTitle('')
        setBody('')
        setSelected([])
      },
    })
  }

  if (!isAdmin) {
    return (
      <ErrorState title="Sem permissão" message="Só a Liderança envia notificações para a casa." />
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Enviar notificação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A mensagem aparece no sino de notificações de cada destinatário.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="space-y-2">
            <label htmlFor="notif-title" className="text-sm font-medium">Título *</label>
            <Input
              id="notif-title"
              value={title}
              maxLength={TITLE_MAX}
              placeholder="Ex.: Lembrete da gira"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notif-body" className="text-sm font-medium">Mensagem *</label>
            <Textarea
              id="notif-body"
              rows={4}
              value={body}
              maxLength={BODY_MAX}
              placeholder="Escreva a mensagem"
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">{body.length}/{BODY_MAX}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Para quem</span>
            <RadioGroup value={audience} onValueChange={(v) => setAudience(v as Audience)} className="gap-2">
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((key) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value={key} />
                  {AUDIENCE_LABELS[key]}
                </label>
              ))}
            </RadioGroup>
          </div>

          {audience === 'selected' && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar membro"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {isError ? (
                <ErrorState title="Erro ao carregar membros" message="Tente novamente." onRetry={() => refetch()} />
              ) : loadingMembers ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Carregando membros...</p>
              ) : (
                <div className="max-h-64 space-y-0.5 overflow-y-auto">
                  {visibleMembers.map((m) => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-muted"
                    >
                      <Checkbox checked={selected.includes(m.userId)} onCheckedChange={() => toggleMember(m.userId)} />
                      <span className="min-w-0 flex-1 truncate">{m.fullName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{ROLE_LABELS[m.role] ?? m.role}</span>
                    </label>
                  ))}
                  {visibleMembers.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">Nenhum membro encontrado</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground" data-testid="notif-recipients">
              {loadingMembers ? 'Contando destinatários...' : `${recipients} destinatário${recipients === 1 ? '' : 's'}`}
            </p>
            <Button className="gap-2" disabled={!valid || send.isPending} onClick={handleSend}>
              <Send className="size-4" />
              {send.isPending ? 'Enviando...' : 'Enviar notificação'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Notificação push no celular ainda não é enviada: o servidor só grava a notificação no app.
      </p>
    </div>
  )
}
