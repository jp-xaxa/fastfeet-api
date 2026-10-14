import { OrderDetails } from '@/domain/carrier/enterprise/entities/value-objects/order-details.js'
import { RecipientPresenter } from './recipient-presenter.js'
import { DeliveryManPresenter } from './delivery-man-presenter.js'

export class OrderDetailsPresenter {
  static toHTTP(orderDetails: OrderDetails) {
    return {
      id: orderDetails.orderId.toString(),
      recipient: RecipientPresenter.toHTTP(orderDetails.recipient),
      deliveryMan: orderDetails.deliveryMan
        ? DeliveryManPresenter.toHTTP(orderDetails.deliveryMan)
        : null,
      createdAt: orderDetails.createdAt,
      updatedAt: orderDetails.updatedAt ?? null,
      waitingAt: orderDetails.waitingAt ?? null,
      withdrawnAt: orderDetails.withdrawnAt ?? null,
      deliveryAt: orderDetails.deliveryAt ?? null,
    }
  }
}
