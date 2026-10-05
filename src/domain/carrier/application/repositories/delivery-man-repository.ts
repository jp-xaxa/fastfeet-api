import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'

export abstract class DeliveryMansRepository {
  abstract findById(id: string): Promise<DeliveryMan | null>
  abstract findByCpf(cpf: string): Promise<DeliveryMan | null>
  abstract create(deliveryMan: DeliveryMan): Promise<void>
  abstract save(deliveryMan: DeliveryMan): Promise<void>
  abstract delete(deliveryMan: DeliveryMan): Promise<void>
  abstract findMany(params: PaginationParams): Promise<DeliveryMan[]>
}
