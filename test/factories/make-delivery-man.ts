import { Injectable } from '@nestjs/common'
import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import {
  DeliveryMan,
  DeliveryManProps,
} from '@/domain/carrier/enterprise/entities/delivery-man.js'

import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { PrismaDeliveryManMapper } from '@/infra/database/prisma/mappers/prisma-delivery-man-mapper.js'

export function makeDeliveryMan(
  override: Partial<DeliveryManProps> = {},
  id?: UniqueEntityID,
) {
  const deliveryMan = DeliveryMan.create(
    {
      name: faker.person.fullName(),
      cpf: faker.string.numeric(11),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )

  return deliveryMan
}

@Injectable()
export class DeliveryManFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaDeliveryMan(
    data: Partial<DeliveryManProps> = {},
  ): Promise<DeliveryMan> {
    const deliveryMan = makeDeliveryMan(data)

    await this.prisma.user.create({
      data: PrismaDeliveryManMapper.toPrisma(deliveryMan),
    })

    return deliveryMan
  }
}
