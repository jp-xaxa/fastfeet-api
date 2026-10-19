import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'
import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { PrismaNotificationMapper } from '../mappers/prisma-notification-mapper.js'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository.js'
import { Notification } from '@/domain/notification/enterprise/entities/notification.js'

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id,
      },
    })

    if (!notification) {
      return null
    }

    return PrismaNotificationMapper.toDomain(notification)
  }

  async findManyByRecipientId(
    recipientId: string,
    { page }: PaginationParams,
  ): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        recipientId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return notifications.map(PrismaNotificationMapper.toDomain)
  }

  async create(notification: Notification): Promise<void> {
    const data = PrismaNotificationMapper.toPrisma(notification)

    await this.prisma.notification.create({
      data,
    })
  }

  async save(notification: Notification): Promise<void> {
    const data = PrismaNotificationMapper.toPrisma(notification)

    await this.prisma.notification.update({
      where: {
        id: notification.id.toString(),
      },
      data,
    })
  }
}
