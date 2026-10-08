import { CreateRecipientUseCase } from './create-recipient.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: CreateRecipientUseCase

describe('Create recipient', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    sut = new CreateRecipientUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to create a recipient', async () => {
    const result = await sut.execute({
      name: 'João',
      street: 'Rua Amaro Ribeiro',
      neighborhood: 'Centro',
      number: 7,
      complement: 'Apartamento 404',
      cep: '36400-011',
      uf: 'MG',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryRecipientsRepository.items[0]).toEqual(
      result.value?.recipient,
    )
  })
})
