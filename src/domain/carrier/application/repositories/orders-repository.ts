import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { Order } from '@/domain/carrier/enterprise/entities/order.js'

export abstract class OrdersRepository {
  abstract findById(id: string): Promise<Order | null>
  abstract save(question: Order): Promise<void>
  abstract create(question: Order): Promise<void>
  abstract delete(question: Order): Promise<void>
  abstract findMany(params: PaginationParams): Promise<Order[]>
}
