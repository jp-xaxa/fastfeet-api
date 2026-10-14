import { Order } from '@/domain/carrier/enterprise/entities/order.js'

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id.toString(),
      recipientId: order.recipientId.toString(),
      deliveryManId: order.deliveryManId?.toString() ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? null,
      waitingAt: order.waitingAt ?? null,
      withdrawnAt: order.withdrawnAt ?? null,
      deliveryAt: order.deliveryAt ?? null,
    }
  }
}
