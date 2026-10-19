import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'
import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { OrdersRepository } from '@/domain/carrier/application/repositories/orders-repository.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { PrismaOrderMapper } from '../mappers/prisma-order-mapper.js'
import { OrderDetails } from '@/domain/carrier/enterprise/entities/value-objects/order-details.js'
import { PrismaOrderDetailsMapper } from '../mappers/prisma-order-details-mapper.js'
import { DomainEvents } from '@/core/events/domain-events.js'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
      },
    })

    if (!order) {
      return null
    }

    return PrismaOrderMapper.toDomain(order)
  }

  async findDetailsById(id: string): Promise<OrderDetails | null> {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        recipient: true,
        deliveryMan: true,
      },
    })

    if (!order) {
      return null
    }

    const orderDetails = PrismaOrderDetailsMapper.toDomain(order)

    return orderDetails
  }

  async existsByRecipientId(recipientId: string): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        recipientId,
      },
      select: {
        id: true,
      },
    })

    return !!order
  }

  async create(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order)

    await this.prisma.order.create({
      data,
    })

    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async save(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order)

    await this.prisma.order.update({
      where: {
        id: order.id.toString(),
      },
      data,
    })

    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async delete(order: Order): Promise<void> {
    await this.prisma.order.delete({
      where: {
        id: order.id.toString(),
      },
    })
  }

  async findMany({ page }: PaginationParams): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      take: 20,
      skip: (page - 1) * 20,
    })

    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findManyByDeliveryManId(
    deliveryManId: string,
    { page }: PaginationParams,
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        deliveryManId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return orders.map(PrismaOrderMapper.toDomain)
  }
}
