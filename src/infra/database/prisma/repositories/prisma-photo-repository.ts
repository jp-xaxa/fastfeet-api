import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'
import { PhotosRepository } from '@/domain/carrier/application/repositories/photos-repository.js'
import { Photo } from '@/domain/carrier/enterprise/entities/photo.js'
import { PrismaPhotoMapper } from '../mappers/prisma-photo-mapper.js'

@Injectable()
export class PrismaPhotosRepository implements PhotosRepository {
  constructor(private prisma: PrismaService) {}

  async create(photo: Photo): Promise<void> {
    const data = PrismaPhotoMapper.toPrisma(photo)

    await this.prisma.photo.create({
      data,
    })
  }
}
