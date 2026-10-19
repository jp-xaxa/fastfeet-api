import { Module } from '@nestjs/common'
import { OnOrderCreated } from '@/domain/notification/application/subscribers/on-order-created.js'
import { OnOrderStatusUpdated } from '@/domain/notification/application/subscribers/on-order-status-updated.js'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification.js'
import { DatabaseModule } from '../database/database.module.js'

@Module({
  imports: [DatabaseModule],
  providers: [OnOrderCreated, OnOrderStatusUpdated, SendNotificationUseCase],
})
export class EventsModule {}
