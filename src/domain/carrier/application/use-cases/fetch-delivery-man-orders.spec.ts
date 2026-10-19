import { FetchDeliveryManOrdersUseCase } from './fetch-delivery-man-orders.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'

import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeOrder } from '@/test/factories/make-order.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository

let sut: FetchDeliveryManOrdersUseCase

describe('Fetch Delivery Man Orders', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new FetchDeliveryManOrdersUseCase(inMemoryOrdersRepository)
  })

  it('should be able to fetch only the orders of the delivery man', async () => {
    const deliveryManId = new UniqueEntityID('delivery-man-1')
    const anotherDeliveryManId = new UniqueEntityID('delivery-man-2')

    const order1 = makeOrder({ deliveryManId })
    const order2 = makeOrder({ deliveryManId })

    await inMemoryOrdersRepository.create(order1)
    await inMemoryOrdersRepository.create(order2)
    await inMemoryOrdersRepository.create(
      makeOrder({ deliveryManId: anotherDeliveryManId }),
    )
    await inMemoryOrdersRepository.create(makeOrder())

    const result = await sut.execute({
      deliveryManId: deliveryManId.toString(),
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.orders).toHaveLength(2)
    expect(result.value?.orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: order1.id }),
        expect.objectContaining({ id: order2.id }),
      ]),
    )
  })

  it('should return the most recent orders first', async () => {
    const deliveryManId = new UniqueEntityID('delivery-man-1')

    const oldestOrder = makeOrder({
      deliveryManId,
      createdAt: new Date(2026, 0, 1),
    })
    const newestOrder = makeOrder({
      deliveryManId,
      createdAt: new Date(2026, 0, 3),
    })
    const middleOrder = makeOrder({
      deliveryManId,
      createdAt: new Date(2026, 0, 2),
    })

    await inMemoryOrdersRepository.create(oldestOrder)
    await inMemoryOrdersRepository.create(newestOrder)
    await inMemoryOrdersRepository.create(middleOrder)

    const result = await sut.execute({
      deliveryManId: deliveryManId.toString(),
      page: 1,
    })

    expect(result.value?.orders).toEqual([
      expect.objectContaining({ id: newestOrder.id }),
      expect.objectContaining({ id: middleOrder.id }),
      expect.objectContaining({ id: oldestOrder.id }),
    ])
  })

  it('should be able to fetch paginated delivery man orders', async () => {
    const deliveryManId = new UniqueEntityID('delivery-man-1')

    for (let i = 1; i <= 22; i++) {
      await inMemoryOrdersRepository.create(makeOrder({ deliveryManId }))
    }

    const result = await sut.execute({
      deliveryManId: deliveryManId.toString(),
      page: 2,
    })

    expect(result.value?.orders).toHaveLength(2)
  })

  it('should return an empty list when the delivery man has no orders', async () => {
    await inMemoryOrdersRepository.create(
      makeOrder({ deliveryManId: new UniqueEntityID('delivery-man-2') }),
    )

    const result = await sut.execute({
      deliveryManId: 'delivery-man-1',
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.orders).toHaveLength(0)
  })
})
