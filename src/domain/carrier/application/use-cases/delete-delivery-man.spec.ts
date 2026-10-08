import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeDeliveryMan } from '@/test/factories/make-delivery-man.js'

import { DeleteDeliveryManUseCase } from './delete-delivery-man.js'

let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository

let sut: DeleteDeliveryManUseCase

describe('Delete Delivery Man', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()

    sut = new DeleteDeliveryManUseCase(inMemoryDeliveryMansRepository)
  })

  it('should be able to delete a delivery man', async () => {
    const deliveryMan = makeDeliveryMan()

    await inMemoryDeliveryMansRepository.create(deliveryMan)

    await sut.execute({ deliveryManId: deliveryMan.id.toString() })

    expect(inMemoryDeliveryMansRepository.items).toHaveLength(0)
    expect(inMemoryDeliveryMansRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a delivery man who does not exist', async () => {
    const result = await sut.execute({ deliveryManId: 'delivery-man-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
