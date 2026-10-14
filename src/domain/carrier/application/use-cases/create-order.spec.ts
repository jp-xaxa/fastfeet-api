import { CreateOrderUseCase } from './create-order.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let sut: CreateOrderUseCase

describe('Create Order', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )
    sut = new CreateOrderUseCase(
      inMemoryOrdersRepository,
      inMemoryRecipientsRepository,
    )
  })

  it('should be able to create a order', async () => {
    const recipient = makeRecipient()

    inMemoryRecipientsRepository.create(recipient)

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(inMemoryOrdersRepository.items[0]).toEqual(result.value?.order)
    }
  })

  it('should not be able to create a order with a recipient that does not exist', async () => {
    const result = await sut.execute({ recipientId: 'recipient-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
