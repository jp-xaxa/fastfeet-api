import { CreateOrderUseCase } from './create-order.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: CreateOrderUseCase

describe('Create Order', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new CreateOrderUseCase(inMemoryOrdersRepository)
  })

  it('should be able to create a question', async () => {
    const result = await sut.execute({
      clientId: '1',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryOrdersRepository.items[0]).toEqual(result.value?.order)
  })
})
