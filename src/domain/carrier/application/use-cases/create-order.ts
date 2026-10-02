import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { OrdersRepository } from '../repositories/orders-repository.js'

interface CreateOrderUseCaseRequest {
  clientId: string
}

type CreateOrderUseCaseResponse = Either<
  null,
  {
    order: Order
  }
>

@Injectable()
export class CreateOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    clientId,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const order = Order.create({
      clientId: new UniqueEntityID(clientId),
    })

    await this.ordersRepository.create(order)

    return right({
      order,
    })
  }
}
