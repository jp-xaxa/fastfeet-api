import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'
import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { DeliveryMansRepository } from '@/domain/carrier/application/repositories/delivery-man-repository.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'
import { PrismaDeliveryManMapper } from '../mappers/prisma-delivery-man-mapper.js'

@Injectable()
export class PrismaDeliveryMansRepository implements DeliveryMansRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<DeliveryMan | null> {
    const deliveryMan = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'DELIVERY_MAN',
      },
    })

    if (!deliveryMan) {
      return null
    }

    return PrismaDeliveryManMapper.toDomain(deliveryMan)
  }

  async findByCpf(cpf: string): Promise<DeliveryMan | null> {
    const deliveryMan = await this.prisma.user.findFirst({
      where: {
        cpf,
        role: 'DELIVERY_MAN',
      },
    })

    if (!deliveryMan) {
      return null
    }

    return PrismaDeliveryManMapper.toDomain(deliveryMan)
  }

  async create(deliveryMan: DeliveryMan): Promise<void> {
    const data = PrismaDeliveryManMapper.toPrisma(deliveryMan)

    await this.prisma.user.create({
      data,
    })
  }

  async save(deliveryMan: DeliveryMan): Promise<void> {
    const data = PrismaDeliveryManMapper.toPrisma(deliveryMan)

    await this.prisma.user.update({
      where: {
        id: deliveryMan.id.toString(),
      },
      data,
    })
  }

  async delete(deliveryMan: DeliveryMan): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: deliveryMan.id.toString(),
      },
    })
  }

  async findMany({ page }: PaginationParams): Promise<DeliveryMan[]> {
    const deliveryMans = await this.prisma.user.findMany({
      where: {
        role: 'DELIVERY_MAN',
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return deliveryMans.map(PrismaDeliveryManMapper.toDomain)
  }
}
