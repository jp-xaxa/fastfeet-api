import { UpdateOrderStatusForDeliveredUseCase } from './update-order-status-for-delivered.js'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.js'
import { OrderNotWithdrawnError } from './errors/order-not-withdrawn-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeOrder } from '@/test/factories/make-order.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: UpdateOrderStatusForDeliveredUseCase

describe('Update Order Status For Delivered', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new UpdateOrderStatusForDeliveredUseCase(inMemoryOrdersRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to update a order status for delivered', async () => {
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
      deliveryManId: deliveryManId.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(inMemoryOrdersRepository.items[0].deliveryAt).toEqual(now)
    expect(inMemoryOrdersRepository.items[0].status).toBe('delivered')
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
  ])(
    'should not be able to update a order status for delivered when it is %s',
    async (_status, override) => {
      const order = makeOrder(override)

      await inMemoryOrdersRepository.create(order)

      const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

      const result = await sut.execute({
        orderId: order.id.toString(),
        deliveryManId: 'delivery-man-1',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(OrderNotWithdrawnError)
      expect(saveSpy).not.toHaveBeenCalled()
      expect(inMemoryOrdersRepository.items[0].deliveryAt).toEqual(
        'deliveryAt' in override ? override.deliveryAt : undefined,
      )
    },
  )

  it('should not be able to update a order status for delivered from another delivery man', async () => {
    const order = makeOrder({
      deliveryManId: new UniqueEntityID('delivery-man-1'),
      waitingAt: new Date(2026, 0, 1),
      withdrawnAt: new Date(2026, 0, 2),
    })

    await inMemoryOrdersRepository.create(order)

    const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliveryManId: 'delivery-man-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(saveSpy).not.toHaveBeenCalled()
    expect(inMemoryOrdersRepository.items[0].deliveryAt).toBeUndefined()
    expect(inMemoryOrdersRepository.items[0].status).toBe('withdrawn')
  })

  it('should not be able to update a order does not exist', async () => {
    const result = await sut.execute({
      orderId: 'order-1',
      deliveryManId: 'delivery-man-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
