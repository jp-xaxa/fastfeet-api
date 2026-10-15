import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { DeliveryMansRepository } from '../repositories/delivery-man-repository.js'
import { OrderNotWaitingError } from './errors/order-not-waiting-error.js'

interface UpdateOrderStatusForWithdrawnUseCaseRequest {
  orderId: string
  deliveryManId: string
}

type UpdateOrderStatusForWithdrawnUseCaseResponse = Either<
  ResourceNotFoundError | OrderNotWaitingError,
  {
    order: Order
  }
>

@Injectable()
export class UpdateOrderStatusForWithdrawnUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private deliveryMansRepository: DeliveryMansRepository,
  ) {}

  async execute({
    orderId,
    deliveryManId,
  }: UpdateOrderStatusForWithdrawnUseCaseRequest): Promise<UpdateOrderStatusForWithdrawnUseCaseResponse> {
    const deliveryMan =
      await this.deliveryMansRepository.findById(deliveryManId)

    if (!deliveryMan) {
      return left(new ResourceNotFoundError())
    }

    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    if (order.status !== 'waiting') {
      return left(new OrderNotWaitingError(orderId))
    }

    order.markAsWithdrawn(deliveryMan.id)

    await this.ordersRepository.save(order)

    return right({
      order,
    })
  }
}
