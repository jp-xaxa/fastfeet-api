import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'
import { AdministratorsRepository } from '@/domain/carrier/application/repositories/administrator-repository.js'
import { Administrator } from '@/domain/carrier/enterprise/entities/administrator.js'
import { PrismaAdministratorMapper } from '../mappers/prisma-administrator-mapper.js'

@Injectable()
export class PrismaAdministratorsRepository implements AdministratorsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Administrator | null> {
    const administrator = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'ADMINISTRATOR',
      },
    })

    if (!administrator) {
      return null
    }

    return PrismaAdministratorMapper.toDomain(administrator)
  }

  async findByCpf(cpf: string): Promise<Administrator | null> {
    const administrator = await this.prisma.user.findFirst({
      where: {
        cpf,
        role: 'ADMINISTRATOR',
      },
    })

    if (!administrator) {
      return null
    }

    return PrismaAdministratorMapper.toDomain(administrator)
  }

  async create(administrator: Administrator): Promise<void> {
    const data = PrismaAdministratorMapper.toPrisma(administrator)

    await this.prisma.user.create({
      data,
    })
  }

  async save(administrator: Administrator): Promise<void> {
    const data = PrismaAdministratorMapper.toPrisma(administrator)

    await this.prisma.user.update({
      where: {
        id: administrator.id.toString(),
      },
      data,
    })
  }

  async delete(administrator: Administrator): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: administrator.id.toString(),
      },
    })
  }
}
