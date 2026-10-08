import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either.js'
import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'
import { RecipientsRepository } from '../repositories/recipient-repository.js'

interface CreateRecipientUseCaseRequest {
  name: string
  street: string
  neighborhood: string
  number?: number | null
  complement?: string | null
  cep: string
  uf: string
}

type CreateRecipientUseCaseResponse = Either<
  null,
  {
    recipient: Recipient
  }
>

@Injectable()
export class CreateRecipientUseCase {
  constructor(private recipientsRepository: RecipientsRepository) {}

  async execute({
    name,
    street,
    neighborhood,
    number,
    complement,
    cep,
    uf,
  }: CreateRecipientUseCaseRequest): Promise<CreateRecipientUseCaseResponse> {
    const recipient = Recipient.create({
      name,
      street,
      neighborhood,
      number,
      complement,
      cep,
      uf,
    })

    await this.recipientsRepository.create(recipient)

    return right({
      recipient,
    })
  }
}
