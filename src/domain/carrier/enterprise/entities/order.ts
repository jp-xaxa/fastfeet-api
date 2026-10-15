import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Optional } from '@/core/types/optional.js'

export type OrderStatus = 'pending' | 'waiting' | 'withdrawn' | 'delivered'

export interface OrderProps {
  recipientId: UniqueEntityID
  deliveryManId?: UniqueEntityID | null
  createdAt: Date
  updatedAt?: Date | null
  waitingAt?: Date | null
  withdrawnAt?: Date | null
  deliveryAt?: Date | null
}

export class Order extends Entity<OrderProps> {
  get recipientId() {
    return this.props.recipientId
  }

  get deliveryManId() {
    return this.props.deliveryManId
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

  private touch() {
    this.props.updatedAt = new Date()
  }

  set recipientId(recipientId: UniqueEntityID) {
    this.props.recipientId = recipientId

    this.touch()
  }

  set deliveryManId(deliveryManId: UniqueEntityID | undefined | null) {
    this.props.deliveryManId = deliveryManId

    this.touch()
  }

  get status(): OrderStatus {
    if (this.props.deliveryAt) return 'delivered'
    if (this.props.withdrawnAt) return 'withdrawn'
    if (this.props.waitingAt) return 'waiting'

    return 'pending'
  }

  markAsWaiting() {
    if (this.status !== 'pending') {
      throw new Error(
        `Order "${this.id.toString()}" is "${this.status}" and cannot be marked as waiting.`,
      )
    }

    this.props.waitingAt = new Date()
    this.touch()
  }

  static create(props: Optional<OrderProps, 'createdAt'>, id?: UniqueEntityID) {
    const order = new Order(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return order
  }
}
