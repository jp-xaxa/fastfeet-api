import { Entity } from '@/core/entities/entity.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'

export interface PhotoProps {
  url: string
}

export class Photo extends Entity<PhotoProps> {
  get url() {
    return this.props.url
  }

  static create(props: PhotoProps, id?: UniqueEntityID) {
    const photo = new Photo(props, id)

    return photo
  }
}
