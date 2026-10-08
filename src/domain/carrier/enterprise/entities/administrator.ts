import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Optional } from '@/core/types/optional.js'

export interface AdministratorProps {
  name: string
  cpf: string
  password: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Administrator extends Entity<AdministratorProps> {
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

  static create(
    props: Optional<Administrator, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const administrator = new Administrator(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return administrator
  }
}
