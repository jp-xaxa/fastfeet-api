import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Optional } from '@/core/types/optional.js'

interface OrderProps {
  clientId: UniqueEntityID
  deliveryManId?: UniqueEntityID | null
  deliveryStatus?: string
  postedAt: Date
  withdrawnAt?: Date | null
  deliveryAt?: Date | null
  updatedAt?: Date | null
}

export class Order extends Entity<OrderProps> {
  get clientId() {
    return this.props.clientId
  }

  get deliveryManId() {
    return this.props.deliveryManId
  }

  get deliveryStatus() {
    return this.props.deliveryStatus
  }

  get postedAt() {
    return this.props.postedAt
  }

  get withdrawnAt() {
    return this.props.withdrawnAt
  }

  get deliveryAt() {
    return this.props.deliveryAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  set clientId(clientName: UniqueEntityID) {
    this.props.clientId = clientName

    this.touch()
  }

  set deliveryManId(deliveryManId: UniqueEntityID | undefined | null) {
    this.props.deliveryManId = deliveryManId

    this.touch()
  }

  static create(
    props: Optional<OrderProps, 'postedAt' | 'withdrawnAt' | 'deliveryAt'>,
    id?: UniqueEntityID,
  ) {
    const question = new Order(
      {
        ...props,
        postedAt: props.postedAt ?? new Date(),
        withdrawnAt: props.withdrawnAt ? props.withdrawnAt : null,
        deliveryAt: props.deliveryAt ? props.deliveryAt : null,
      },
      id,
    )

    return question
  }
}
