'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { notesService } from '@/services/notes'
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  DeleteNoteRequest,
} from '@/types'
import { toast } from 'sonner'

export function useNotes(page = 1) {
  const houseId = useAuthStore((s) => s.currentHouseId())

  return useQuery({
    queryKey: ['notes', houseId, page],
    queryFn: () =>
      notesService.listNotes({
        houseId: houseId!,
        page,
        limit: 20,
      }),
    enabled: !!houseId,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNoteRequest) =>
      notesService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Anotação criada')
    },
    onError: () => {
      toast.error('Erro ao criar anotação')
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNoteRequest) =>
      notesService.updateNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Anotação atualizada')
    },
    onError: () => {
      toast.error('Erro ao atualizar anotação')
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeleteNoteRequest) =>
      notesService.deleteNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Anotação removida')
    },
    onError: () => {
      toast.error('Erro ao remover anotação')
    },
  })
}
