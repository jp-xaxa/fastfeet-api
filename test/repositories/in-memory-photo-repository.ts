import { PhotosRepository } from '@/domain/carrier/application/repositories/photos-repository.js'
import { Photo } from '@/domain/carrier/enterprise/entities/photo.js'

export class InMemoryPhotosRepository implements PhotosRepository {
  public items: Photo[] = []

  async create(photo: Photo) {
    this.items.push(photo)
  }
}
