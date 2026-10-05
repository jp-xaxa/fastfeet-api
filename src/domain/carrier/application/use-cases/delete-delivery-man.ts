import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { DeliveryMansRepository } from '../repositories/delivery-man-repository.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.js'

interface DeleteDeliveryManUseCaseRequest {
  deliveryManId: string
}

type DeleteDeliveryManUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>

@Injectable()
export class DeleteDeliveryManUseCase {
  constructor(private deliveryMansRepository: DeliveryMansRepository) {}

  async execute({
    deliveryManId,
  }: DeleteDeliveryManUseCaseRequest): Promise<DeleteDeliveryManUseCaseResponse> {
    const deliveryMan =
      await this.deliveryMansRepository.findById(deliveryManId)

    if (!deliveryMan) {
      return left(new ResourceNotFoundError())
    }

    this.deliveryMansRepository.delete(deliveryMan)

    return right(null)
  }
}
