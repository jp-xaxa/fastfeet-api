import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'

interface DeleteOrderUseCaseRequest {
  orderId: string
}

type DeleteOrderUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
  }: DeleteOrderUseCaseRequest): Promise<DeleteOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    await this.ordersRepository.delete(order)

    return right(null)
  }
}
