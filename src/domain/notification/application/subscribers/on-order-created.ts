import { Injectable } from '@nestjs/common'
import { DomainEvents } from '@/core/events/domain-events.js'
import { EventHandler } from '@/core/events/event-handler.js'
import { RecipientsRepository } from '@/domain/carrier/application/repositories/recipient-repository.js'
import { OrderCreatedEvent } from '@/domain/carrier/enterprise/events/order-created-event.js'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification.js'

@Injectable()
export class OnOrderCreated implements EventHandler {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewOrderNotification.bind(this),
      OrderCreatedEvent.name,
    )
  }

  private async sendNewOrderNotification({ order }: OrderCreatedEvent) {
    const recipient = await this.recipientsRepository.findById(
      order.recipientId.toString(),
    )

    if (recipient) {
      await this.sendNotification.execute({
        recipientId: recipient.id.toString(),
        title: 'Nova encomenda cadastrada',
        content: `Olá ${recipient.name}, uma nova encomenda foi cadastrada para você.`,
      })
    }
  }
}
