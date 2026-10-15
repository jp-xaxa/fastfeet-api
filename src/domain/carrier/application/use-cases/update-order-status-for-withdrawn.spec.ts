import { UpdateOrderStatusForWithdrawnUseCase } from './update-order-status-for-withdrawn.js'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { OrderNotWaitingError } from './errors/order-not-waiting-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeOrder } from '@/test/factories/make-order.js'
import { makeDeliveryMan } from '@/test/factories/make-delivery-man.js'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let sut: UpdateOrderStatusForWithdrawnUseCase

describe('Update Order Status For Withdrawn', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )

    sut = new UpdateOrderStatusForWithdrawnUseCase(
      inMemoryOrdersRepository,
      inMemoryDeliveryMansRepository,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to update a order status for withdrawn', async () => {
    const now = new Date(2026, 0, 2, 10, 0, 0)
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const deliveryMan = makeDeliveryMan()

    await inMemoryDeliveryMansRepository.create(deliveryMan)

    const order = makeOrder({ waitingAt: new Date(2026, 0, 1) })

    await inMemoryOrdersRepository.create(order)

    const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliveryManId: deliveryMan.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(inMemoryOrdersRepository.items[0].withdrawnAt).toEqual(now)
    expect(inMemoryOrdersRepository.items[0].deliveryManId).toEqual(
      deliveryMan.id,
    )
    expect(inMemoryOrdersRepository.items[0].status).toBe('withdrawn')
  })

  it.each([
    ['pending', {}],
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
    'should not be able to update a order status for withdrawn when it is %s',
    async (_status, override) => {
      const deliveryMan = makeDeliveryMan()

      await inMemoryDeliveryMansRepository.create(deliveryMan)

      const order = makeOrder(override)

      await inMemoryOrdersRepository.create(order)

      const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

      const result = await sut.execute({
        orderId: order.id.toString(),
        deliveryManId: deliveryMan.id.toString(),
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(OrderNotWaitingError)
      expect(saveSpy).not.toHaveBeenCalled()
      expect(inMemoryOrdersRepository.items[0].deliveryManId).toBeUndefined()
      expect(inMemoryOrdersRepository.items[0].withdrawnAt).toEqual(
        'withdrawnAt' in override ? override.withdrawnAt : undefined,
      )
    },
  )

  it('should not be able to update a order status for withdrawn with a delivery man does not exist', async () => {
    const order = makeOrder({ waitingAt: new Date(2026, 0, 1) })

    await inMemoryOrdersRepository.create(order)

    const saveSpy = vi.spyOn(inMemoryOrdersRepository, 'save')

    const result = await sut.execute({
      orderId: order.id.toString(),
      deliveryManId: 'delivery-man-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(saveSpy).not.toHaveBeenCalled()
    expect(inMemoryOrdersRepository.items[0].deliveryManId).toBeUndefined()
    expect(inMemoryOrdersRepository.items[0].withdrawnAt).toBeUndefined()
  })

  it('should not be able to update a order does not exist', async () => {
    const deliveryMan = makeDeliveryMan()

    await inMemoryDeliveryMansRepository.create(deliveryMan)

    const result = await sut.execute({
      orderId: 'order-1',
      deliveryManId: deliveryMan.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
