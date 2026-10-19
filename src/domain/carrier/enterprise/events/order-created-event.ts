import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { DomainEvent } from '@/core/events/domain-event.js'
import { Order } from '../entities/order.js'

export class OrderCreatedEvent implements DomainEvent {
  public ocurredAt: Date
  public order: Order

  constructor(order: Order) {
    this.order = order
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.order.id
  }
}
