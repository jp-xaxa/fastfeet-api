import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Optional } from '@/core/types/optional.js'

export interface DeliveryManProps {
  name: string
  cpf: string
  password: string
  createdAt: Date
  updatedAt?: Date | null
}

export class DeliveryMan extends Entity<DeliveryManProps> {
  get name() {
    return this.props.name
  }

  get cpf() {
    return this.props.cpf
  }

  get password() {
    return this.props.password
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set password(password: string) {
    this.props.password = password
    this.touch()
  }

  static create(
    props: Optional<DeliveryManProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const deliveryMan = new DeliveryMan(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return deliveryMan
  }
}
