import { Notification } from '@/domain/notification/enterprise/entities/notification.js'

export class NotificationPresenter {
  static toHTTP(notification: Notification) {
    return {
      id: notification.id.toString(),
      recipientId: notification.recipientId.toString(),
      title: notification.title,
      content: notification.content,
      readAt: notification.readAt ?? null,
      createdAt: notification.createdAt,
    }
  }
}
