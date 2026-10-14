import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Optional } from '@/core/types/optional.js'

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

  set waitingAt(waitingAt: Date | null | undefined) {
    this.props.waitingAt = waitingAt ?? null
    this.touch()
  }

  set withdrawnAt(withdrawnAt: Date | null | undefined) {
    this.props.withdrawnAt = withdrawnAt ?? null
    this.touch()
  }

  set deliveryAt(deliveryAt: Date | null | undefined) {
    this.props.deliveryAt = deliveryAt ?? null
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
