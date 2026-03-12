import { callFunction } from '@/lib/callable'
import type {
  CreateEventRequest,
  EventItem,
  UpdateEventRequest,
  ListEventsRequest,
  DeleteEventRequest,
  PaginatedResponse,
} from '@/types'

export const calendarService = {
  createEvent: (data: CreateEventRequest) =>
    callFunction<CreateEventRequest, EventItem>('createEvent', data),

  updateEvent: (data: UpdateEventRequest) =>
    callFunction<UpdateEventRequest, EventItem>('updateEvent', data),

  listEvents: (data: ListEventsRequest) =>
    callFunction<ListEventsRequest, PaginatedResponse<EventItem>>('listEvents', data),

  deleteEvent: (data: DeleteEventRequest) =>
    callFunction<DeleteEventRequest, { message: string }>('deleteEvent', data),
}
