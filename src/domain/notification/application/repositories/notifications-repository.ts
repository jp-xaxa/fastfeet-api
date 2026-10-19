import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { Notification } from '../../enterprise/entities/notification.js'

export abstract class NotificationsRepository {
  abstract findById(id: string): Promise<Notification | null>
  abstract findManyByRecipientId(
    recipientId: string,
    params: PaginationParams,
  ): Promise<Notification[]>

  abstract create(notification: Notification): Promise<void>
  abstract save(notification: Notification): Promise<void>
}
