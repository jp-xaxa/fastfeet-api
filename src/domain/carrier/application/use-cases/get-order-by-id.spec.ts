import { GetOrderByIdUseCase } from './get-order-by-id.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeOrder } from '@/test/factories/make-order.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'
import { makeDeliveryMan } from '@/test/factories/make-delivery-man.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository

let sut: GetOrderByIdUseCase

describe('Get Order By Id', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new GetOrderByIdUseCase(inMemoryOrdersRepository)
  })

  it('should be able to get an order by id with its delivery man', async () => {
    const recipient = makeRecipient({ name: 'João' })
    inMemoryRecipientsRepository.items.push(recipient)

    const deliveryMan = makeDeliveryMan({ name: 'Pedro' })
    inMemoryDeliveryMansRepository.items.push(deliveryMan)

    const order = makeOrder({
      recipientId: recipient.id,
      deliveryManId: deliveryMan.id,
    })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      order: expect.objectContaining({
        orderId: order.id,
        recipient: expect.objectContaining({ name: 'João' }),
        deliveryMan: expect.objectContaining({ name: 'Pedro' }),
      }),
    })
  })

  it('should return delivery man as null when the order has none', async () => {
    const recipient = makeRecipient()
    inMemoryRecipientsRepository.items.push(recipient)

    const order = makeOrder({ recipientId: recipient.id })
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      order: expect.objectContaining({
        recipient: expect.objectContaining({ name: recipient.name }),
        deliveryMan: null,
      }),
    })
  })

  it('should not be able to get a non-existing order', async () => {
    const result = await sut.execute({
      orderId: 'non-existing-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
