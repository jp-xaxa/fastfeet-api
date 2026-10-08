import { EditRecipientUseCase } from './edit-recipient.js'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: EditRecipientUseCase

describe('Edit Recipient', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()

    sut = new EditRecipientUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to edit a recipient', async () => {
    const recipient = makeRecipient({
      name: 'João',
      street: 'Avenida Brasil',
      neighborhood: 'Rosário',
      cep: '36400-011',
      uf: 'MG',
    })

    await inMemoryRecipientsRepository.create(recipient)

    const saveSpy = vi.spyOn(inMemoryRecipientsRepository, 'save')

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
      name: 'João Pedro',
      street: 'Avenida Paulista',
      neighborhood: 'Rosário',
      number: 5,
      complement: 'Apart. 300',
      cep: '36400-011',
      uf: 'MG',
    })

    expect(result.isRight()).toBe(true)
    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(inMemoryRecipientsRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'João Pedro',
        street: 'Avenida Paulista',
        neighborhood: 'Rosário',
        number: 5,
        complement: 'Apart. 300',
        cep: '36400-011',
        uf: 'MG',
      }),
    )
  })

  it('should be able to clear number and complement of a recipient', async () => {
    const recipient = makeRecipient({
      number: 5,
      complement: 'Apart. 300',
    })

    await inMemoryRecipientsRepository.create(recipient)

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
      name: recipient.name,
      street: recipient.street,
      neighborhood: recipient.neighborhood,
      cep: recipient.cep,
      uf: recipient.uf,
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryRecipientsRepository.items[0]).toEqual(
      expect.objectContaining({
        number: null,
        complement: null,
      }),
    )
  })

  it('should not be able to edit a recipient from another recipient', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    const result = await sut.execute({
      recipientId: 'other',
      name: 'João Pedro',
      street: 'Avenida Paulista',
      neighborhood: 'Rosário',
      number: 5,
      complement: 'Apart. 300',
      cep: '36400-011',
      uf: 'MG',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
