import {
  Order as PrismaOrder,
  User as PrismaUser,
  Recipient as PrismaRecipient,
} from '@/generated/prisma/client.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { OrderDetails } from '@/domain/carrier/enterprise/entities/value-objects/order-details.js'
import { PrismaRecipientMapper } from './prisma-recipient-mapper.js'
import { PrismaDeliveryManMapper } from './prisma-delivery-man-mapper.js'

type PrismaOrderDetails = PrismaOrder & {
  recipient: PrismaRecipient
  deliveryMan: PrismaUser | null
}

export class PrismaOrderDetailsMapper {
  static toDomain(raw: PrismaOrderDetails): OrderDetails {
    return OrderDetails.create({
      orderId: new UniqueEntityID(raw.id),
      recipient: PrismaRecipientMapper.toDomain(raw.recipient),
      deliveryMan: raw.deliveryMan
        ? PrismaDeliveryManMapper.toDomain(raw.deliveryMan)
        : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      waitingAt: raw.waitingAt,
      withdrawnAt: raw.withdrawnAt,
      deliveryAt: raw.deliveryAt,
    })
  }
}
