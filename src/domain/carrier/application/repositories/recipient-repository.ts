import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'

export abstract class RecipientsRepository {
  abstract findById(id: string): Promise<Recipient | null>
  abstract create(recipient: Recipient): Promise<void>
  abstract save(recipient: Recipient): Promise<void>
  abstract delete(recipient: Recipient): Promise<void>
  abstract findMany(params: PaginationParams): Promise<Recipient[]>
}
