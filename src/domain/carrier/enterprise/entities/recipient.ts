import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Optional } from '@/core/types/optional.js'

export interface RecipientProps {
  name: string
  street: string
  neighborhood: string
  number?: number | null
  complement?: string | null
  cep: string
  uf: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Recipient extends Entity<RecipientProps> {
  get name() {
    return this.props.name
  }

  get street() {
    return this.props.street
  }

  get neighborhood() {
    return this.props.neighborhood
  }

  get number() {
    return this.props.number
  }

  get complement() {
    return this.props.complement
  }

  get cep() {
    return this.props.cep
  }

  get uf() {
    return this.props.uf
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

  set street(street: string) {
    this.props.street = street
    this.touch()
  }

  set neighborhood(neighborhood: string) {
    this.props.neighborhood = neighborhood
    this.touch()
  }

  set number(number: number | undefined | null) {
    this.props.number = number ?? null
    this.touch()
  }

  set complement(complement: string | undefined | null) {
    this.props.complement = complement ?? null
    this.touch()
  }

  set cep(cep: string) {
    this.props.cep = cep
    this.touch()
  }

  set uf(uf: string) {
    this.props.uf = uf
    this.touch()
  }

  static create(
    props: Optional<RecipientProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const recipient = new Recipient(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return recipient
  }
}
