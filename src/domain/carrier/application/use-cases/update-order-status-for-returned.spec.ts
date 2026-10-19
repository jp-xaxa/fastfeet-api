import { UpdateOrderStatusForReturnedUseCase } from './update-order-status-for-returned.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrderCannotBeReturnedError } from './errors/order-cannot-be-returned-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeOrder } from '@/test/factories/make-order.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: UpdateOrderStatusForReturnedUseCase

describe('Update Order Status For Returned', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new UpdateOrderStatusForReturnedUseCase(inMemoryOrdersRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to update a order status for returned', async () => {
    const now = new Date(2026, 0, 3, 10, 0, 0)
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const deliveryManId = new UniqueEntityID('delivery-man-1')

    const order = makeOrder({
      deliveryManId,
      waitingAt: new Date(2026, 0, 1),
      withdrawnAt: new Date(2026, 0, 2),
    })

    await inMemoryOrdersRepository.create(order)

    const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

    const result = await sut.execute({
      orderId: order.id.toString(),
      reason: 'Destinatário ausente',
    })

    expect(result.isRight()).toBe(true)
    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(inMemoryOrdersRepository.items[0].returnedAt).toEqual(now)
    expect(inMemoryOrdersRepository.items[0].returnReason).toBe(
      'Destinatário ausente',
    )
    expect(inMemoryOrdersRepository.items[0].deliveryManId).toEqual(
      deliveryManId,
    )
    expect(inMemoryOrdersRepository.items[0].status).toBe('returned')
  })

  it.each([
    ['pending', {}],
    ['waiting', { waitingAt: new Date(2026, 0, 1) }],
    [
      'delivered',
      {
        deliveryManId: new UniqueEntityID('delivery-man-1'),
        waitingAt: new Date(2026, 0, 1),
        withdrawnAt: new Date(2026, 0, 2),
        deliveryAt: new Date(2026, 0, 3),
      },
    ],
    [
      'returned',
      {
        deliveryManId: new UniqueEntityID('delivery-man-1'),
        waitingAt: new Date(2026, 0, 1),
        withdrawnAt: new Date(2026, 0, 2),
        returnedAt: new Date(2026, 0, 3),
        returnReason: 'Endereço não encontrado',
      },
    ],
  ])(
    'should not be able to update a order status for returned when it is %s',
    async (_status, override) => {
      const order = makeOrder(override)

      await inMemoryOrdersRepository.create(order)

      const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

      const result = await sut.execute({
        orderId: order.id.toString(),
        reason: 'Destinatário ausente',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(OrderCannotBeReturnedError)
      expect(saveSpy).not.toHaveBeenCalled()
      expect(inMemoryOrdersRepository.items[0].returnedAt).toEqual(
        'returnedAt' in override ? override.returnedAt : undefined,
      )
      expect(inMemoryOrdersRepository.items[0].returnReason).toEqual(
        'returnReason' in override ? override.returnReason : undefined,
      )
    },
  )

  it('should not be able to update a order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'order-1',
      reason: 'Destinatário ausente',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
