import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'

import { DeleteOrderUseCase } from './delete-order.js'
import { makeOrder } from '@/test/factories/make-order.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryOrdersRepository: InMemoryOrdersRepository

let sut: DeleteOrderUseCase

describe('Delete Order', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new DeleteOrderUseCase(inMemoryOrdersRepository)
  })

  it('should be able to delete a order', async () => {
    const order = makeOrder()

    await inMemoryOrdersRepository.create(order)

    await sut.execute({ orderId: order.id.toString() })

    expect(inMemoryOrdersRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a order who does not exist', async () => {
    const result = await sut.execute({ orderId: 'recipient-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
