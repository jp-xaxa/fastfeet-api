import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'

import { DeleteRecipientUseCase } from './delete-recipient.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: DeleteRecipientUseCase

describe('Delete Recipient', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()

    sut = new DeleteRecipientUseCase(inMemoryRecipientsRepository)
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
})
