import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { OrdersRepository } from '../repositories/orders-repository.js'

interface FetchOrdersUseCaseRequest {
  page: number
}

type FetchOrdersUseCaseResponse = Either<
  null,
  {
    orders: Order[]
  }
>

@Injectable()
export class FetchOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    page,
  }: FetchOrdersUseCaseRequest): Promise<FetchOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findMany({
      page,
    })

    return right({
      orders,
    })
  }
}
