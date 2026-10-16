import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { OrderNotWithdrawnError } from './errors/order-not-withdrawn-error.js'

interface UpdateOrderStatusForDeliveredUseCaseRequest {
  orderId: string
  deliveryManId: string
}

type UpdateOrderStatusForDeliveredUseCaseResponse = Either<
  ResourceNotFoundError | OrderNotWithdrawnError | NotAllowedError,
  {
    order: Order
  }
>

@Injectable()
export class UpdateOrderStatusForDeliveredUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    deliveryManId,
  }: UpdateOrderStatusForDeliveredUseCaseRequest): Promise<UpdateOrderStatusForDeliveredUseCaseResponse> {
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

    order.markAsDelivered(new UniqueEntityID(deliveryManId))

    await this.ordersRepository.save(order)

    return right({
      order,
    })
  }
}
