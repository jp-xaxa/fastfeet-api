import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'
import { makeOrder } from '@/test/factories/make-order.js'

import { DeleteRecipientUseCase } from './delete-recipient.js'
import { RecipientHasOrdersError } from './errors/recipient-has-orders-error.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryOrdersRepository: InMemoryOrdersRepository

let sut: DeleteRecipientUseCase

describe('Delete Recipient', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new DeleteRecipientUseCase(
      inMemoryRecipientsRepository,
      inMemoryOrdersRepository,
    )
  })

  it('should be able to delete a recipient', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    await sut.execute({ recipientId: recipient.id.toString() })

    expect(inMemoryRecipientsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a recipient who does not exist', async () => {
    const result = await sut.execute({ recipientId: 'recipient-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a recipient who has orders', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryOrdersRepository.create(
      makeOrder({ recipientId: recipient.id }),
    )

    const result = await sut.execute({ recipientId: recipient.id.toString() })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(RecipientHasOrdersError)
    expect(inMemoryRecipientsRepository.items).toHaveLength(1)
  })
})
