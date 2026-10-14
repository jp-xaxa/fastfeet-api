import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { RecipientsRepository } from '../repositories/recipient-repository.js'

interface CreateOrderUseCaseRequest {
  recipientId: string
}

type CreateOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order
  }
>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    recipientId,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    const order = Order.create({
      recipientId: new UniqueEntityID(recipientId),
    })

    await this.ordersRepository.create(order)

    return right({
      order,
    })
  }
}
