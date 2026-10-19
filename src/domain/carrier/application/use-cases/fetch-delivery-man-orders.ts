import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { OrdersRepository } from '../repositories/orders-repository.js'

interface FetchDeliveryManOrdersUseCaseRequest {
  deliveryManId: string
  page: number
}

type FetchDeliveryManOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
  }
>

@Injectable()
export class FetchDeliveryManOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    deliveryManId,
    page,
  }: FetchDeliveryManOrdersUseCaseRequest): Promise<FetchDeliveryManOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findManyByDeliveryManId(
      deliveryManId,
      {
        page,
      },
    )

    return right({
      orders,
    })
  }
}
