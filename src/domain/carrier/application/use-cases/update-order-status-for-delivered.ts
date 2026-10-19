import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { Photo } from '@/domain/carrier/enterprise/entities/photo.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { PhotosRepository } from '../repositories/photos-repository.js'
import { Uploader } from '../storage/uploader.js'
import { OrderNotWithdrawnError } from './errors/order-not-withdrawn-error.js'
import { InvalidPhotoTypeError } from './errors/invalid-photo-type-error.js'

const VALID_PHOTO_TYPES = /^image\/(jpeg|png|webp)$/

interface UpdateOrderStatusForDeliveredUseCaseRequest {
  orderId: string
  deliveryManId: string
  fileName: string
  fileType: string
  body: Buffer
}

type UpdateOrderStatusForDeliveredUseCaseResponse = Either<
  | ResourceNotFoundError
  | OrderNotWithdrawnError
  | NotAllowedError
  | InvalidPhotoTypeError,
  {
    order: Order
  }
>

@Injectable()
export class UpdateOrderStatusForDeliveredUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private photosRepository: PhotosRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    orderId,
    deliveryManId,
    fileName,
    fileType,
    body,
  }: UpdateOrderStatusForDeliveredUseCaseRequest): Promise<UpdateOrderStatusForDeliveredUseCaseResponse> {
    if (!VALID_PHOTO_TYPES.test(fileType)) {
      return left(new InvalidPhotoTypeError(fileType))
    }

    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    if (order.status !== 'withdrawn') {
      return left(new OrderNotWithdrawnError(orderId))
    }

    if (order.deliveryManId?.toString() !== deliveryManId) {
      return left(new NotAllowedError())
    }

    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    const photo = Photo.create({ url })

    try {
      await this.photosRepository.create(photo)

      order.markAsDelivered(new UniqueEntityID(deliveryManId), photo.id)

      await this.ordersRepository.save(order)
    } catch (error) {
      await this.discardPhoto(photo)

      throw error
    }

    return right({
      order,
    })
  }

  private async discardPhoto(photo: Photo) {
    // Melhor esforço: uma falha na limpeza não pode esconder o erro original
    await Promise.allSettled([
      this.photosRepository.delete(photo),
      this.uploader.delete(photo.url),
    ])
  }
}
