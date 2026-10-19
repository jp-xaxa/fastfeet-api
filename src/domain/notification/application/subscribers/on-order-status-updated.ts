import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events.js'
import { EventHandler } from '@/core/events/event-handler.js'
import { RecipientsRepository } from '@/domain/carrier/application/repositories/recipient-repository.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import {
  OrderStatusUpdatedEvent,
  UpdatedOrderStatus,
} from '@/domain/carrier/enterprise/events/order-status-updated-event.js'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification.js'

const notificationsByStatus: Record<
  UpdatedOrderStatus,
  { title: string; content: (order: Order) => string }
> = {
  waiting: {
    title: 'Encomenda aguardando retirada',
    content: () =>
      'Sua encomenda está disponível para ser retirada pelo entregador.',
  },
  withdrawn: {
    title: 'Encomenda saiu para entrega',
    content: () => 'Sua encomenda foi retirada e está a caminho.',
  },
  delivered: {
    title: 'Encomenda entregue',
    content: () => 'Sua encomenda foi entregue com sucesso.',
  },
  returned: {
    title: 'Encomenda devolvida',
    content: (order) =>
      `Sua encomenda foi devolvida. Motivo: ${order.returnReason}`,
  },
}

@Injectable()
export class OnOrderStatusUpdated implements EventHandler {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderStatusUpdatedNotification.bind(this),
      OrderStatusUpdatedEvent.name,
    )
  }

  private async sendOrderStatusUpdatedNotification({
    order,
    status,
  }: OrderStatusUpdatedEvent) {
    const recipient = await this.recipientsRepository.findById(
      order.recipientId.toString(),
    )

    if (recipient) {
      const { title, content } = notificationsByStatus[status]

      await this.sendNotification.execute({
        recipientId: recipient.id.toString(),
        title,
        content: content(order),
      })
    }
  }
}
