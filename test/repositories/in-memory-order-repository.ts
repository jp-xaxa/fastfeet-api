// import { DomainEvents } from '@/core/events/domain-events.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { OrdersRepository } from '@/domain/carrier/application/repositories/orders-repository.js'
import { OrderDetails } from '@/domain/carrier/enterprise/entities/value-objects/order-details.js'
import { InMemoryRecipientsRepository } from './in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from './in-memory-delivery-man-repository.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  constructor(
    private recipientRepository: InMemoryRecipientsRepository,
    private deliveryManRepository: InMemoryDeliveryMansRepository,
  ) {}

  async findById(id: string) {
    const order = this.items.find((item) => item.id.toString() === id)

    if (!order) {
      return null
    }

    return order
  }

  async findDetailsById(id: string): Promise<OrderDetails | null> {
    const order = this.items.find((item) => item.id.toString() === id)

    if (!order) {
      return null
    }

    const recipient = this.recipientRepository.items.find((recipient) => {
      return recipient.id.equals(order.recipientId)
    })

    if (!recipient) {
      throw new Error(
        `Recipient with ID "${order.recipientId}" does not exist.`,
      )
    }

    const deliveryManId = order.deliveryManId

    let deliveryMan: DeliveryMan | null = null

    if (deliveryManId) {
      const foundDeliveryMan = this.deliveryManRepository.items.find((item) => {
        return item.id.equals(deliveryManId)
      })

      if (!foundDeliveryMan) {
        throw new Error(
          `Delivery Man with ID "${deliveryManId}" does not exist.`,
        )
      }

      deliveryMan = foundDeliveryMan
    }

    return OrderDetails.create({
      orderId: order.id,
      recipient,
      deliveryMan,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      waitingAt: order.waitingAt,
      withdrawnAt: order.withdrawnAt,
      deliveryAt: order.deliveryAt,
      returnedAt: order.returnedAt,
      returnReason: order.returnReason,
    })
  }

  async existsByRecipientId(recipientId: string) {
    return this.items.some(
      (item) => item.recipientId.toString() === recipientId,
    )
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

  async findManyByDeliveryManId(
    deliveryManId: string,
    { page }: PaginationParams,
  ) {
    const orders = this.items
      .filter((item) => item.deliveryManId?.toString() === deliveryManId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return orders
  }
}
