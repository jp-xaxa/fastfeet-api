import { Injectable } from '@nestjs/common'
import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import {
  Recipient,
  RecipientProps,
} from '@/domain/carrier/enterprise/entities/recipient.js'

import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { PrismaRecipientMapper } from '@/infra/database/prisma/mappers/prisma-recipient-mapper.js'

export function makeRecipient(
  override: Partial<RecipientProps> = {},
  id?: UniqueEntityID,
) {
  const recipient = Recipient.create(
    {
      name: faker.person.fullName(),
      street: faker.location.street(),
      neighborhood: faker.location.city(),
      number: faker.number.int({ min: 1, max: 9999 }),
      complement: faker.helpers.arrayElement([
        null,
        'Apto 101',
        'Casa',
        'Bloco A',
        'Sala 2',
      ]),
      cep: faker.location.zipCode('#####-###'),
      uf: faker.location.state({ abbreviated: true }),
      ...override,
    },
    id,
  )

  return recipient
}

@Injectable()
export class RecipientFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaRecipient(
    data: Partial<RecipientProps> = {},
  ): Promise<Recipient> {
    const recipient = makeRecipient(data)

    await this.prisma.recipient.create({
      data: PrismaRecipientMapper.toPrisma(recipient),
    })

    return recipient
  }
}
