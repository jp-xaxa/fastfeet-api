import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { RecipientsRepository } from '../repositories/recipient-repository.js'
import { OrdersRepository } from '../repositories/orders-repository.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { RecipientHasOrdersError } from './errors/recipient-has-orders-error.js'

interface DeleteRecipientUseCaseRequest {
  recipientId: string
}

type DeleteRecipientUseCaseResponse = Either<
  ResourceNotFoundError | RecipientHasOrdersError,
  null
>

@Injectable()
export class DeleteRecipientUseCase {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    recipientId,
  }: DeleteRecipientUseCaseRequest): Promise<DeleteRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    const recipientHasOrders =
      await this.ordersRepository.existsByRecipientId(recipientId)

    if (recipientHasOrders) {
      return left(new RecipientHasOrdersError(recipientId))
    }

    await this.recipientsRepository.delete(recipient)

    return right(null)
  }
}
