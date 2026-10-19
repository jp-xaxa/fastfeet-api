import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { OrderCannotBeReturnedError } from './errors/order-cannot-be-returned-error.js'

interface UpdateOrderStatusForReturnedUseCaseRequest {
  orderId: string
  reason: string
}

type UpdateOrderStatusForReturnedUseCaseResponse = Either<
  ResourceNotFoundError | OrderCannotBeReturnedError,
  {
    order: Order
  }
>

@Injectable()
export class UpdateOrderStatusForReturnedUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    reason,
  }: UpdateOrderStatusForReturnedUseCaseRequest): Promise<UpdateOrderStatusForReturnedUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    if (order.status !== 'withdrawn') {
      return left(new OrderCannotBeReturnedError(orderId))
    }

    order.markAsReturned(reason)

    await this.ordersRepository.save(order)

    return right({
      order,
    })
  }
}
