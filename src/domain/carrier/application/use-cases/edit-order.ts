import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { RecipientsRepository } from '../repositories/recipient-repository.js'

interface EditOrderUseCaseRequest {
  recipientId: string
  orderId: string
}

type EditOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order
  }
>

@Injectable()
export class EditOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    recipientId,
    orderId,
  }: EditOrderUseCaseRequest): Promise<EditOrderUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    order.recipientId = recipient.id

    await this.ordersRepository.save(order)

    return right({
      order,
    })
  }
}
