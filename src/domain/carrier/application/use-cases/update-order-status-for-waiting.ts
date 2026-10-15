import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { OrderNotPendingError } from './errors/order-not-pending-error.js'

interface UpdateOrderStatusForWaitingUseCaseRequest {
  orderId: string
}

type UpdateOrderStatusForWaitingUseCaseResponse = Either<
  ResourceNotFoundError | OrderNotPendingError,
  {
    order: Order
  }
>

@Injectable()
export class UpdateOrderStatusForWaitingUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
  }: UpdateOrderStatusForWaitingUseCaseRequest): Promise<UpdateOrderStatusForWaitingUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    if (order.status !== 'pending') {
      return left(new OrderNotPendingError(orderId))
    }

    order.markAsWaiting()

    await this.ordersRepository.save(order)

    return right({
      order,
    })
  }
}
