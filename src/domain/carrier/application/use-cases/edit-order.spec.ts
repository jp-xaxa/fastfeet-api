import { EditOrderUseCase } from './edit-order.js'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'
import { makeOrder } from '@/test/factories/make-order.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: EditOrderUseCase

describe('Edit Order', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new EditOrderUseCase(
      inMemoryOrdersRepository,
      inMemoryRecipientsRepository,
    )
  })

  it('should be able to edit a order', async () => {
    const recipient1 = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient1)

    const order = makeOrder({ recipientId: recipient1.id })

    await inMemoryOrdersRepository.create(order)

    const recipient2 = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient2)

    const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

    const result = await sut.execute({
      recipientId: recipient2.id.toString(),
      orderId: order.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(inMemoryOrdersRepository.items[0]).toEqual(
      expect.objectContaining({
        recipientId: recipient2.id,
      }),
    )
  })

  it('should not be able to edit a order with a recipient that does not exist.', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    const order = makeOrder({ recipientId: recipient.id })

    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      recipientId: 'recipient-not',
      orderId: order.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to edit a order does not exist', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
      orderId: 'order-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
