import { FetchRecipientsUseCase } from './fetch-recipient.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: FetchRecipientsUseCase

describe('Fetch Recipients', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()

    sut = new FetchRecipientsUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to fetch recipient', async () => {
    const recipient1 = makeRecipient({
      name: 'João',
    })
    const recipient2 = makeRecipient({
      name: 'Pedro',
    })
    const recipient3 = makeRecipient({
      name: 'Nanda',
    })

    inMemoryRecipientsRepository.create(recipient1)
    inMemoryRecipientsRepository.create(recipient2)
    inMemoryRecipientsRepository.create(recipient3)

    const result = await sut.execute({
      page: 1,
    })

    expect(result.value?.recipients).toHaveLength(3)
    expect(result.value?.recipients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'João',
        }),
        expect.objectContaining({
          name: 'Pedro',
        }),
        expect.objectContaining({
          name: 'Nanda',
        }),
      ]),
    )
  })

  it('should be able to fetch paginated recipients', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryRecipientsRepository.create(makeRecipient())
    }

    const result = await sut.execute({
      page: 2,
    })

    expect(result.value?.recipients).toHaveLength(2)
  })
})
