import { Injectable } from '@nestjs/common'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import {
  Order,
  OrderProps,
} from '@/domain/carrier/enterprise/entities/order.js'

import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { PrismaOrderMapper } from '@/infra/database/prisma/mappers/prisma-order-mapper.js'

export function makeOrder(
  override: Partial<OrderProps> = {},
  id?: UniqueEntityID,
) {
  const order = Order.create(
    {
      recipientId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return order
}

@Injectable()
export class OrderFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaOrder(data: Partial<OrderProps> = {}): Promise<Order> {
    // Com id explícito a Order não gera OrderCreatedEvent: como ela é inserida
    // direto no banco, o evento nunca seria disparado e ficaria pendente no
    // DomainEvents, impedindo que eventos futuros dessa mesma Order disparem
    const order = makeOrder(data, new UniqueEntityID())

    await this.prisma.order.create({
      data: PrismaOrderMapper.toPrisma(order),
    })

    return order
  }
}
