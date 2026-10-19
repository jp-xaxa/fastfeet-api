import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'
import { OrderDetails } from '../../enterprise/entities/value-objects/order-details.js'

export abstract class OrdersRepository {
  abstract findById(id: string): Promise<Order | null>
  abstract findDetailsById(id: string): Promise<OrderDetails | null>
  abstract existsByRecipientId(recipientId: string): Promise<boolean>
  abstract save(question: Order): Promise<void>
  abstract create(question: Order): Promise<void>
  abstract delete(question: Order): Promise<void>
  abstract findMany(params: PaginationParams): Promise<Order[]>
  abstract findManyByDeliveryManId(
    deliveryManId: string,
    params: PaginationParams,
  ): Promise<Order[]>
}
