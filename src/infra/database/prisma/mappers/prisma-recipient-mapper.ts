import {
  Recipient as PrismaRecipient,
  Prisma,
} from '@/generated/prisma/client.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'

export class PrismaRecipientMapper {
  static toDomain(raw: PrismaRecipient): Recipient {
    return Recipient.create(
      {
        name: raw.name,
        street: raw.street,
        neighborhood: raw.neighborhood,
        number: raw.number,
        complement: raw.complement,
        cep: raw.cep,
        uf: raw.uf,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(recipient: Recipient): Prisma.RecipientUncheckedCreateInput {
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      street: recipient.street,
      neighborhood: recipient.neighborhood,
      number: recipient.number,
      complement: recipient.complement,
      cep: recipient.cep,
      uf: recipient.uf,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    }
  }
}
