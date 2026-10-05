import { User as PrismaUser, Prisma } from '@/generated/prisma/client.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'

export class PrismaDeliveryManMapper {
  static toDomain(raw: PrismaUser): DeliveryMan {
    return DeliveryMan.create(
      {
        name: raw.name,
        cpf: raw.cpf,
        password: raw.password,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(student: DeliveryMan): Prisma.UserUncheckedCreateInput {
    return {
      id: student.id.toString(),
      name: student.name,
      cpf: student.cpf,
      password: student.password,
    }
  }
}
