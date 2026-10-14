import { FetchOrdersUseCase } from './fetch-order.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeOrder } from '@/test/factories/make-order.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository

let sut: FetchOrdersUseCase

describe('Fetch Orders', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new FetchOrdersUseCase(inMemoryOrdersRepository)
  })

  it('should be able to fetch order', async () => {
    const order1 = makeOrder()
    const order2 = makeOrder()
    const order3 = makeOrder()

    inMemoryOrdersRepository.create(order1)
    inMemoryOrdersRepository.create(order2)
    inMemoryOrdersRepository.create(order3)

    const result = await sut.execute({
      page: 1,
    })

    expect(result.value?.orders).toHaveLength(3)
    expect(result.value?.orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: order1.id,
        }),
        expect.objectContaining({
          id: order2.id,
        }),
        expect.objectContaining({
          id: order3.id,
        }),
      ]),
    )
  })

  it('should be able to fetch paginated order', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryOrdersRepository.create(makeOrder())
    }

    const result = await sut.execute({
      page: 2,
    })

    expect(result.value?.orders).toHaveLength(2)
  })
})
