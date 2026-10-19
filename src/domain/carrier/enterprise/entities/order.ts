import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Optional } from '@/core/types/optional.js'

export type OrderStatus =
  'pending' | 'waiting' | 'withdrawn' | 'delivered' | 'returned'

export interface OrderProps {
  recipientId: UniqueEntityID
  deliveryManId?: UniqueEntityID | null
  createdAt: Date
  updatedAt?: Date | null
  waitingAt?: Date | null
  withdrawnAt?: Date | null
  deliveryAt?: Date | null
  photoId?: UniqueEntityID | null
  returnedAt?: Date | null
  returnReason?: string | null
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

  get photoId() {
    return this.props.photoId
  }

  get returnedAt() {
    return this.props.returnedAt
  }

  get returnReason() {
    return this.props.returnReason
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
    if (this.props.returnedAt) return 'returned'
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

  markAsWithdrawn(deliveryManId: UniqueEntityID) {
    if (this.status !== 'waiting') {
      throw new Error(
        `Order "${this.id.toString()}" is "${this.status}" and cannot be marked as withdrawn.`,
      )
    }

    this.props.deliveryManId = deliveryManId
    this.props.withdrawnAt = new Date()
    this.touch()
  }

  markAsDelivered(deliveryManId: UniqueEntityID, photoId: UniqueEntityID) {
    if (this.status !== 'withdrawn') {
      throw new Error(
        `Order "${this.id.toString()}" is "${this.status}" and cannot be marked as delivered.`,
      )
    }

    if (!this.props.deliveryManId?.equals(deliveryManId)) {
      throw new Error(
        `Order "${this.id.toString()}" can only be marked as delivered by the delivery man who withdrew it.`,
      )
    }

    this.props.photoId = photoId
    this.props.deliveryAt = new Date()
    this.touch()
  }

  markAsReturned(reason: string) {
    if (this.status !== 'withdrawn') {
      throw new Error(
        `Order "${this.id.toString()}" is "${this.status}" and cannot be marked as returned.`,
      )
    }

    this.props.returnReason = reason
    this.props.returnedAt = new Date()
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
