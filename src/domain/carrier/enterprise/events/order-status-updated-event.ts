import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { DomainEvent } from '@/core/events/domain-event.js'
import { Order, OrderStatus } from '../entities/order.js'

export type UpdatedOrderStatus = Exclude<OrderStatus, 'pending'>

export class OrderStatusUpdatedEvent implements DomainEvent {
  public ocurredAt: Date
  public order: Order
  public status: UpdatedOrderStatus

  constructor(order: Order, status: UpdatedOrderStatus) {
    this.order = order
    this.status = status
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.order.id
  }
}
