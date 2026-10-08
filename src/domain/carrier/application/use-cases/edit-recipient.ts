import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'
import { RecipientsRepository } from '../repositories/recipient-repository.js'

interface EditRecipientUseCaseRequest {
  recipientId: string
  name: string
  street: string
  neighborhood: string
  number?: number | null
  complement?: string | null
  cep: string
  uf: string
}

type EditRecipientUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    recipient: Recipient
  }
>

@Injectable()
export class EditRecipientUseCase {
  constructor(private recipientsRepository: RecipientsRepository) {}

  async execute({
    recipientId,
    name,
    street,
    neighborhood,
    number,
    complement,
    cep,
    uf,
  }: EditRecipientUseCaseRequest): Promise<EditRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    recipient.name = name
    recipient.street = street
    recipient.neighborhood = neighborhood
    recipient.number = number
    recipient.complement = complement
    recipient.cep = cep
    recipient.uf = uf

    await this.recipientsRepository.save(recipient)

    return right({
      recipient,
    })
  }
}
