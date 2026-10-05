import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'

export interface DeliveryManProps {
  name: string
  cpf: string
  password: string
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

  static create(props: DeliveryManProps, id?: UniqueEntityID) {
    const deliveryMan = new DeliveryMan(props, id)

    return deliveryMan
  }
}
