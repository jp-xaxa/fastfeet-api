import { Photo } from '@/domain/carrier/enterprise/entities/photo.js'

export abstract class PhotosRepository {
  abstract create(photo: Photo): Promise<void>
}
