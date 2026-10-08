import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { RecipientsRepository } from '@/domain/carrier/application/repositories/recipient-repository.js'
import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'

export class InMemoryRecipientsRepository implements RecipientsRepository {
  public items: Recipient[] = []

  async findById(id: string) {
    const recipient = this.items.find((item) => item.id.toString() === id)

    if (!recipient) {
      return null
    }

    return recipient
  }

  async create(recipient: Recipient) {
    this.items.push(recipient)
  }

  async save(recipient: Recipient) {
    const itemIndex = this.items.findIndex((item) => item.id === recipient.id)

    this.items[itemIndex] = recipient
  }

  async delete(recipient: Recipient) {
    const itemIndex = this.items.findIndex((item) => item.id === recipient.id)

    this.items.splice(itemIndex, 1)
  }

  async findMany({ page }: PaginationParams) {
    const recipient = this.items.slice((page - 1) * 20, page * 20)

    return recipient
  }
}
