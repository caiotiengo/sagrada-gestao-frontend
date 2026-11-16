import { callFunction } from '@/lib/callable'
import type {
  CreateEventRequest,
  EventItem,
  UpdateEventRequest,
  ListEventsRequest,
  DeleteEventRequest,
  RsvpEventRequest,
  RsvpEventResponse,
  ListEventAttendeesRequest,
  EventAttendee,
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

  confirmAttendance: (data: RsvpEventRequest) =>
    callFunction<RsvpEventRequest, RsvpEventResponse>('confirmAttendance', data),

  cancelAttendance: (data: RsvpEventRequest) =>
    callFunction<RsvpEventRequest, RsvpEventResponse>('cancelAttendance', data),

  listEventAttendees: (data: ListEventAttendeesRequest) =>
    callFunction<ListEventAttendeesRequest, PaginatedResponse<EventAttendee>>('listEventAttendees', data),
}
