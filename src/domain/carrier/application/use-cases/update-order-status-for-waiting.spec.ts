import { UpdateOrderStatusForWaitingUseCase } from './update-order-status-for-waiting.js'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrderNotPendingError } from './errors/order-not-pending-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeOrder } from '@/test/factories/make-order.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: UpdateOrderStatusForWaitingUseCase

describe('Update Order Status For Waiting', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new UpdateOrderStatusForWaitingUseCase(inMemoryOrdersRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to update a order status for waiting', async () => {
    const now = new Date(2026, 0, 1, 10, 0, 0)
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const order = makeOrder()

    await inMemoryOrdersRepository.create(order)

    const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

    const result = await sut.execute({
      orderId: order.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(inMemoryOrdersRepository.items[0].waitingAt).toEqual(now)
  })

  it.each([
    ['waiting', { waitingAt: new Date(2026, 0, 1) }],
    [
      'withdrawn',
      { waitingAt: new Date(2026, 0, 1), withdrawnAt: new Date(2026, 0, 2) },
    ],
    [
      'delivered',
      {
        waitingAt: new Date(2026, 0, 1),
        withdrawnAt: new Date(2026, 0, 2),
        deliveryAt: new Date(2026, 0, 3),
      },
    ],
  ])(
    'should not be able to update a order status for waiting when it is %s',
    async (_status, override) => {
      const order = makeOrder(override)

      await inMemoryOrdersRepository.create(order)

      const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

      const result = await sut.execute({
        orderId: order.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(OrderNotPendingError)
      expect(saveSpy).not.toHaveBeenCalled()
      expect(inMemoryOrdersRepository.items[0].waitingAt).toEqual(
        override.waitingAt,
      )
    },
  )

  it('should not be able to update a order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'order-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
