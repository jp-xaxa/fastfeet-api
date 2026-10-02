// import { DomainEvents } from '@/core/events/domain-events.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { OrdersRepository } from '@/domain/carrier/application/repositories/orders-repository.js'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  constructor() {}

  async findById(id: string) {
    const order = this.items.find((item) => item.id.toString() === id)

    if (!order) {
      return null
    }

    return order
  }

  async save(order: Order) {
    const itemIndex = this.items.findIndex((item) => item.id === order.id)

    this.items[itemIndex] = order
  }

  async create(order: Order) {
    this.items.push(order)
  }

  async delete(order: Order) {
    const itemIndex = this.items.findIndex((item) => item.id === order.id)

    this.items.splice(itemIndex, 1)
  }

  async findMany({ page }: PaginationParams) {
    const orders = this.items.slice((page - 1) * 20, page * 20)

    return orders
  }
}
