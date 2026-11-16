'use client'

import { useState } from 'react'
import { Plus, Megaphone, Pencil, Trash2, Pin, PinOff } from 'lucide-react'
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '@/hooks/use-notices'
import { useAuthStore } from '@/stores/auth'
import { civilDateOf, todayBRT } from '@/utils/dates'
import type { NoticeItem } from '@/types'
import { NoticeCard, isNoticeExpired } from '@/components/notices/notice-card'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DateInput } from '@/components/forms/date-input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

const TITLE_MAX = 140
const BODY_MAX = 2000

interface NoticeForm {
  title: string
  body: string
  pinned: boolean
  /** YYYY-MM-DD ou '' (sem validade). */
  expiresAt: string
}

const EMPTY_FORM: NoticeForm = { title: '', body: '', pinned: false, expiresAt: '' }

function formError(form: NoticeForm): string | null {
  const title = form.title.trim()
  if (title.length < 3) return 'O título precisa de pelo menos 3 caracteres'
  if (title.length > TITLE_MAX) return `O título pode ter até ${TITLE_MAX} caracteres`
  if (!form.body.trim()) return 'Escreva o texto do aviso'
  if (form.body.length > BODY_MAX) return `O texto pode ter até ${BODY_MAX} caracteres`
  if (form.expiresAt && form.expiresAt < todayBRT()) return 'A validade não pode ser uma data passada'
  return null
}

export default function AdminNoticesPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const canManage = useAuthStore((s) => s.hasPermission('canManageMembers'))
  const [page, setPage] = useState(1)
  const [showExpired, setShowExpired] = useState(false)
  const { data, isLoading, isError, refetch } = useNotices(page, showExpired)
  const createNotice = useCreateNotice()
  const updateNotice = useUpdateNotice()
  const deleteNotice = useDeleteNotice()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NoticeItem | null>(null)
  const [form, setForm] = useState<NoticeForm>(EMPTY_FORM)
  const [toDelete, setToDelete] = useState<NoticeItem | null>(null)

  const notices = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1
  const error = formError(form)
  const saving = createNotice.isPending || updateNotice.isPending

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (notice: NoticeItem) => {
    setEditing(notice)
    setForm({
      title: notice.title,
      body: notice.body,
      pinned: !!notice.pinned,
      expiresAt: notice.expiresAt ? civilDateOf(notice.expiresAt) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!houseId || error) return
    const onSuccess = () => {
      setDialogOpen(false)
      setEditing(null)
      setForm(EMPTY_FORM)
    }
    if (editing) {
      const prevExpires = editing.expiresAt ? civilDateOf(editing.expiresAt) : ''
      updateNotice.mutate(
        {
          houseId,
          noticeId: editing.id,
          title: form.title.trim(),
          body: form.body.trim(),
          pinned: form.pinned,
          // Só manda a validade se mudou; '' vira null (remove o prazo).
          ...(form.expiresAt !== prevExpires ? { expiresAt: form.expiresAt || null } : {}),
        },
        { onSuccess },
      )
    } else {
      createNotice.mutate(
        {
          houseId,
          title: form.title.trim(),
          body: form.body.trim(),
          pinned: form.pinned,
          ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
        },
        { onSuccess },
      )
    }
  }

  const togglePin = (notice: NoticeItem) => {
    if (!houseId) return
    updateNotice.mutate({ houseId, noticeId: notice.id, pinned: !notice.pinned })
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar avisos"
        message="Não foi possível carregar o mural. Tente novamente."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Mural de avisos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Avisos da liderança para os membros da casa
          </p>
        </div>
        {canManage && (
          <Button size="sm" className="shrink-0 gap-2" onClick={openCreate}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo aviso</span>
            <span className="sr-only sm:hidden">Novo aviso</span>
          </Button>
        )}
      </div>

      {canManage && (
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={showExpired}
            onCheckedChange={(v) => { setShowExpired(v); setPage(1) }}
          />
          Mostrar vencidos
        </label>
      )}

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : notices.length > 0 ? (
        <div className="space-y-3">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              actions={
                canManage ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={notice.pinned ? 'Desafixar aviso' : 'Fixar aviso'}
                      onClick={() => togglePin(notice)}
                      disabled={updateNotice.isPending || isNoticeExpired(notice)}
                    >
                      {notice.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar aviso"
                      onClick={() => openEdit(notice)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Excluir aviso"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setToDelete(notice)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="Nenhum aviso no mural"
          description={canManage ? 'Publique um aviso para os membros da casa.' : 'A liderança ainda não publicou avisos.'}
          action={canManage ? { label: 'Novo aviso', onClick: openCreate } : undefined}
          className="min-h-[30dvh]"
        />
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">{page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Próximo
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar aviso' : 'Novo aviso'}</DialogTitle>
            <DialogDescription>
              Todos os membros ativos da casa veem o aviso no mural e no painel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="notice-title" className="text-sm font-medium">Título *</label>
              <Input
                id="notice-title"
                placeholder="Ex.: Gira de sábado cancelada"
                value={form.title}
                maxLength={TITLE_MAX}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notice-body" className="text-sm font-medium">Texto *</label>
              <Textarea
                id="notice-body"
                rows={5}
                placeholder="Escreva o aviso"
                value={form.body}
                maxLength={BODY_MAX}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
              <p className="text-right text-xs text-muted-foreground">{form.body.length}/{BODY_MAX}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="notice-expires" className="text-sm font-medium">Válido até (opcional)</label>
              <div className="flex items-center gap-2">
                <DateInput
                  id="notice-expires"
                  value={form.expiresAt}
                  onValueChange={(v) => setForm((f) => ({ ...f, expiresAt: v }))}
                />
                {form.expiresAt && (
                  <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, expiresAt: '' }))}>
                    Sem validade
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                O aviso some do mural depois das 23:59 (horário de Brasília) desse dia. Em branco, fica até ser excluído.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Switch checked={form.pinned} onCheckedChange={(v) => setForm((f) => ({ ...f, pinned: v }))} />
              Fixar no topo
            </label>
            {error && (form.title || form.body || form.expiresAt) && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleSave} disabled={saving || !!error}>
              {saving ? 'Salvando...' : editing ? 'Salvar' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => { if (!open) setToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aviso?</AlertDialogTitle>
            <AlertDialogDescription>
              O aviso &quot;{toDelete?.title}&quot; sai do mural de todos os membros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteNotice.isPending}
              onClick={() => {
                if (!houseId || !toDelete) return
                deleteNotice.mutate(
                  { houseId, noticeId: toDelete.id },
                  { onSuccess: () => setToDelete(null) },
                )
              }}
            >
              {deleteNotice.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
