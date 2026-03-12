import { callFunction } from '@/lib/callable'
import type {
  CreateNoteRequest,
  NoteItem,
  UpdateNoteRequest,
  ListNotesRequest,
  DeleteNoteRequest,
  PaginatedResponse,
} from '@/types'

export const notesService = {
  createNote: (data: CreateNoteRequest) =>
    callFunction<CreateNoteRequest, NoteItem>('createNote', data),

  updateNote: (data: UpdateNoteRequest) =>
    callFunction<UpdateNoteRequest, NoteItem>('updateNote', data),

  listNotes: (data: ListNotesRequest) =>
    callFunction<ListNotesRequest, PaginatedResponse<NoteItem>>('listNotes', data),

  deleteNote: (data: DeleteNoteRequest) =>
    callFunction<DeleteNoteRequest, { message: string }>('deleteNote', data),
}
