import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { OrderDetails } from '../../enterprise/entities/value-objects/order-details.js'

interface GetOrderByIdUseCaseRequest {
  orderId: string
}

type GetOrderByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: OrderDetails
  }
>

@Injectable()
export class GetOrderByIdUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
  }: GetOrderByIdUseCaseRequest): Promise<GetOrderByIdUseCaseResponse> {
    const order = await this.ordersRepository.findDetailsById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    return right({
      order,
    })
  }
}
