import { Order as PrismaOrder, Prisma } from '@/generated/prisma/client.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'

export class PrismaOrderMapper {
  static toDomain(raw: PrismaOrder): Order {
    return Order.create(
      {
        recipientId: new UniqueEntityID(raw.recipientId),
        deliveryManId: raw.deliveryManId
          ? new UniqueEntityID(raw.deliveryManId)
          : null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        waitingAt: raw.waitingAt,
        withdrawnAt: raw.withdrawnAt,
        deliveryAt: raw.deliveryAt,
        photoId: raw.photoId ? new UniqueEntityID(raw.photoId) : null,
        returnedAt: raw.returnedAt,
        returnReason: raw.returnReason,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id.toString(),
      recipientId: order.recipientId.toString(),
      deliveryManId: order.deliveryManId?.toString() ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      waitingAt: order.waitingAt,
      withdrawnAt: order.withdrawnAt,
      deliveryAt: order.deliveryAt,
      photoId: order.photoId?.toString() ?? null,
      returnedAt: order.returnedAt,
      returnReason: order.returnReason,
    }
  }
}
