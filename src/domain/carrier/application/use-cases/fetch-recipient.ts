import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either.js'
import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'
import { RecipientsRepository } from '../repositories/recipient-repository.js'

interface FetchRecipientsUseCaseRequest {
  page: number
}

type FetchRecipientsUseCaseResponse = Either<
  null,
  {
    recipients: Recipient[]
  }
>

@Injectable()
export class FetchRecipientsUseCase {
  constructor(private recipientsRepository: RecipientsRepository) {}

  async execute({
    page,
  }: FetchRecipientsUseCaseRequest): Promise<FetchRecipientsUseCaseResponse> {
    const recipients = await this.recipientsRepository.findMany({
      page,
    })

    return right({
      recipients,
    })
  }
}
