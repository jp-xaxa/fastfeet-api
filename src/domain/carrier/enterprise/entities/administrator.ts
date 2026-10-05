import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'

export interface AdministratorProps {
  name: string
  cpf: string
  password: string
  // status
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

  static create(props: AdministratorProps, id?: UniqueEntityID) {
    const student = new Administrator(props, id)

    return student
  }
}
