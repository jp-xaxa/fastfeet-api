import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { DeliveryMansRepository } from '@/domain/carrier/application/repositories/delivery-man-repository.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'

export class InMemoryDeliveryMansRepository implements DeliveryMansRepository {
  public items: DeliveryMan[] = []

  async findById(id: string) {
    const deliveryMan = this.items.find((item) => item.id.toString() === id)

    if (!deliveryMan) {
      return null
    }

    return deliveryMan
  }

  async findByCpf(cpf: string) {
    const deliveryMan = this.items.find((item) => item.cpf === cpf)

    if (!deliveryMan) {
      return null
    }

    return deliveryMan
  }

  async create(deliveryMan: DeliveryMan) {
    this.items.push(deliveryMan)
  }

  async save(deliveryMan: DeliveryMan) {
    const itemIndex = this.items.findIndex((item) => item.id === deliveryMan.id)

    this.items[itemIndex] = deliveryMan
  }

  async delete(deliveryMan: DeliveryMan) {
    const itemIndex = this.items.findIndex((item) => item.id === deliveryMan.id)

    this.items.splice(itemIndex, 1)
  }

  async findMany({ page }: PaginationParams) {
    const deliveryMan = this.items.slice((page - 1) * 20, page * 20)

    return deliveryMan
  }
}
