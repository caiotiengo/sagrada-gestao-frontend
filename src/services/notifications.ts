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
    callFunction<SendNotificationRequest, { sent: number; type: string }>('sendNotification', data),

  listNotifications: (data: ListNotificationsRequest) =>
    callFunction<ListNotificationsRequest, PaginatedResponse<NotificationItem>>('listNotifications', data),

  markNotificationRead: (data: MarkNotificationReadRequest) =>
    callFunction<MarkNotificationReadRequest, { message: string }>('markNotificationRead', data),

  markAllNotificationsRead: (data: MarkAllNotificationsReadRequest) =>
    callFunction<MarkAllNotificationsReadRequest, { marked: number }>('markAllNotificationsRead', data),

  registerFcmToken: (data: RegisterFcmTokenRequest) =>
    callFunction<RegisterFcmTokenRequest, { message: string }>('registerFcmToken', data),

  registerPushToken: (data: { token: string; provider: 'fcm'; platform: 'web'; deviceName?: string }) =>
    callFunction<typeof data, { registered: boolean }>('registerPushToken', data),

  unregisterPushToken: (data: { token: string }) =>
    callFunction<typeof data, { unregistered: boolean; removed: boolean }>('unregisterPushToken', data),

  getNotificationPreferences: () =>
    callFunction<Record<string, never>, { preferences: NotificationPreferences }>('getNotificationPreferences', {}),

  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) =>
    callFunction<{ preferences: Partial<NotificationPreferences> }, { preferences: NotificationPreferences }>(
      'updateNotificationPreferences',
      { preferences },
    ),
}

export type NotificationCategory = 'notices' | 'events' | 'payments' | 'store' | 'charges' | 'general'
export type NotificationPreferences = Record<NotificationCategory, boolean>
