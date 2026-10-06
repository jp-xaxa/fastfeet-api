import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'

export class DeliveryManPresenter {
  static toHTTP(deliveryMan: DeliveryMan) {
    return {
      id: deliveryMan.id.toString(),
      name: deliveryMan.name,
    }
  }
}
