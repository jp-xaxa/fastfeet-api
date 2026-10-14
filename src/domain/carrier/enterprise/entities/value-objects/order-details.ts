import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { ValueObject } from '@/core/entities/value-object.js'
import { Recipient } from '../recipient.js'
import { DeliveryMan } from '../delivery-man.js'

export interface OrderDetailsProps {
  orderId: UniqueEntityID
  recipient: Recipient
  deliveryMan: DeliveryMan | null
  createdAt: Date
  updatedAt?: Date | null
  waitingAt?: Date | null
  withdrawnAt?: Date | null
  deliveryAt?: Date | null
}

export class OrderDetails extends ValueObject<OrderDetailsProps> {
  get orderId() {
    return this.props.orderId
  }

  get recipient() {
    return this.props.recipient
  }

  get deliveryMan() {
    return this.props.deliveryMan
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get waitingAt() {
    return this.props.waitingAt
  }

  get withdrawnAt() {
    return this.props.withdrawnAt
  }

  get deliveryAt() {
    return this.props.deliveryAt
  }

  static create(props: OrderDetailsProps) {
    return new OrderDetails(props)
  }
}
