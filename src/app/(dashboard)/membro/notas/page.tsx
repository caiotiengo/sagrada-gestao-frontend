'use client'

import { useState } from 'react'
import { StickyNote, Plus, Pencil, Trash2 } from 'lucide-react'
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@/hooks/use-notes'
import { useAuthStore } from '@/stores/auth'
import type { NoteItem } from '@/types'
import { formatDateTime } from '@/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LoadingState } from '@/components/feedback/loading-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { Switch } from '@/components/ui/switch'

export default function MemberNotesPage() {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const { data, isLoading, isError, refetch } = useNotes(1)
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  function openCreateDialog() {
    setEditingNote(null)
    setTitle('')
    setContent('')
    setIsPrivate(false)
    setDialogOpen(true)
  }

  function openEditDialog(note: NoteItem) {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setIsPrivate(note.isPrivate)
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!houseId || !title.trim()) return

    if (editingNote) {
      await updateNote.mutateAsync({
        houseId,
        noteId: editingNote.id,
        title: title.trim(),
        content: content.trim(),
        isPrivate,
      })
    } else {
      await createNote.mutateAsync({
        houseId,
        title: title.trim(),
        content: content.trim(),
        isPrivate,
      })
    }

    setDialogOpen(false)
  }

  function handleDelete(noteId: string) {
    if (!houseId) return
    deleteNote.mutate({ houseId, noteId })
  }

  if (isLoading) {
    return <LoadingState message="Carregando notas..." />
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />
  }

  const notes = data?.data ?? []

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Notas</h1>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="mr-1.5 size-4" />
          Nova nota
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Nenhuma nota"
          description="Você ainda não criou nenhuma nota."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id} className="rounded-xl shadow-sm">
              <CardContent className="space-y-2 py-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate font-medium">{note.title}</h2>
                  {note.isPrivate && (
                    <Badge variant="secondary" className="shrink-0">
                      Privada
                    </Badge>
                  )}
                </div>

                {note.content && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {note.content}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {formatDateTime(note.updatedAt)}
                </p>

                <div className="flex items-center gap-1 pt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => openEditDialog(note)}
                  >
                    <Pencil className="size-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                        />
                      }
                    >
                      <Trash2 className="size-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta nota? Esta ação não
                          pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(note.id)}
                        >
                          {deleteNote.isPending ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Editar nota' : 'Nova nota'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Título</Label>
              <Input
                id="note-title"
                placeholder="Título da nota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-content">Conteúdo</Label>
              <Textarea
                id="note-content"
                placeholder="Escreva sua nota..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="note-private"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="note-private">Nota privada</Label>
            </div>

            <Button
              className="w-full"
              disabled={
                !title.trim() ||
                createNote.isPending ||
                updateNote.isPending
              }
              onClick={handleSubmit}
            >
              {createNote.isPending || updateNote.isPending
                ? 'Salvando...'
                : editingNote
                  ? 'Salvar alterações'
                  : 'Criar nota'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
