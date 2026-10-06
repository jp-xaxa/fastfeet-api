import { Injectable } from '@nestjs/common'
import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import {
  Administrator,
  AdministratorProps,
} from '@/domain/carrier/enterprise/entities/administrator.js'

import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { PrismaAdministratorMapper } from '@/infra/database/prisma/mappers/prisma-administrator-mapper.js'

export function makeAdministrator(
  override: Partial<AdministratorProps> = {},
  id?: UniqueEntityID,
) {
  const administrator = Administrator.create(
    {
      name: faker.person.fullName(),
      cpf: faker.string.numeric(11),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )

  return administrator
}

@Injectable()
export class AdministratorFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAdministrator(
    data: Partial<AdministratorProps> = {},
  ): Promise<Administrator> {
    const administrator = makeAdministrator(data)

    await this.prisma.user.create({
      data: PrismaAdministratorMapper.toPrisma(administrator),
    })

    return administrator
  }
}
