import { User as PrismaUser, Prisma } from '@/generated/prisma/client.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Administrator } from '@/domain/carrier/enterprise/entities/administrator.js'

export class PrismaAdministratorMapper {
  static toDomain(raw: PrismaUser): Administrator {
    return Administrator.create(
      {
        name: raw.name,
        cpf: raw.cpf,
        password: raw.password,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    administrator: Administrator,
  ): Prisma.UserUncheckedCreateInput {
    return {
      id: administrator.id.toString(),
      name: administrator.name,
      cpf: administrator.cpf,
      password: administrator.password,
      role: 'ADMINISTRATOR',
    }
  }
}
