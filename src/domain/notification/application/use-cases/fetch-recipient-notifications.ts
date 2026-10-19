import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { RecipientsRepository } from '@/domain/carrier/application/repositories/recipient-repository.js'
import { Notification } from '../../enterprise/entities/notification.js'
import { NotificationsRepository } from '../repositories/notifications-repository.js'

interface FetchRecipientNotificationsUseCaseRequest {
  recipientId: string
  page: number
}

type FetchRecipientNotificationsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    notifications: Notification[]
  }
>

@Injectable()
export class FetchRecipientNotificationsUseCase {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private notificationsRepository: NotificationsRepository,
  ) {}

  async execute({
    recipientId,
    page,
  }: FetchRecipientNotificationsUseCaseRequest): Promise<FetchRecipientNotificationsUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    const notifications =
      await this.notificationsRepository.findManyByRecipientId(recipientId, {
        page,
      })

    return right({
      notifications,
    })
  }
}
