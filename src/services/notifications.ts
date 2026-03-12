import { callFunction } from '@/lib/callable'
import type {
  SendNotificationRequest,
  ListNotificationsRequest,
  NotificationItem,
  MarkNotificationReadRequest,
  MarkAllNotificationsReadRequest,
  RegisterFcmTokenRequest,
  PaginatedResponse,
} from '@/types'

export const notificationsService = {
  sendNotification: (data: SendNotificationRequest) =>
    callFunction<SendNotificationRequest, { message: string }>('sendNotification', data),

  listNotifications: (data: ListNotificationsRequest) =>
    callFunction<ListNotificationsRequest, PaginatedResponse<NotificationItem>>('listNotifications', data),

  markNotificationRead: (data: MarkNotificationReadRequest) =>
    callFunction<MarkNotificationReadRequest, { message: string }>('markNotificationRead', data),

  markAllNotificationsRead: (data: MarkAllNotificationsReadRequest) =>
    callFunction<MarkAllNotificationsReadRequest, { message: string }>('markAllNotificationsRead', data),

  registerFcmToken: (data: RegisterFcmTokenRequest) =>
    callFunction<RegisterFcmTokenRequest, { message: string }>('registerFcmToken', data),
}
