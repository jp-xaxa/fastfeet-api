import { Photo as PrismaPhoto, Prisma } from '@/generated/prisma/client.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Photo } from '@/domain/carrier/enterprise/entities/photo.js'

export class PrismaPhotoMapper {
  static toDomain(raw: PrismaPhoto): Photo {
    return Photo.create(
      {
        url: raw.url,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(photo: Photo): Prisma.PhotoUncheckedCreateInput {
    return {
      id: photo.id.toString(),
      url: photo.url,
    }
  }
}
