import { EditDeliveryManUseCase } from './edit-delivery-man.js'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { WrongCredentialsError } from './errors/wrong-credentials-error.js'

import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { FakeHasher } from '@/test/cryptography/fake-hasher.js'
import { makeDeliveryMan } from '@/test/factories/make-delivery-man.js'

let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let fakeHasher: FakeHasher

let sut: EditDeliveryManUseCase

describe('Edit Delivery Man', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    fakeHasher = new FakeHasher()

    sut = new EditDeliveryManUseCase(
      inMemoryDeliveryMansRepository,
      fakeHasher,
      fakeHasher,
    )
  })

  it('should be able to edit a delivery man', async () => {
    const deliveryMan = makeDeliveryMan({
      name: 'João',
      cpf: '728.716.032-35',
      password: await fakeHasher.hash('123456'),
    })

    await inMemoryDeliveryMansRepository.create(deliveryMan)

    const saveSpy = vi.spyOn(inMemoryDeliveryMansRepository, 'save')

    const result = await sut.execute({
      deliveryManId: deliveryMan.id.toString(),
      name: 'Pedro',
      password: '123456',
      newPassword: '654321',
    })

    expect(result.isRight()).toBe(true)
    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pedro',
        password: await fakeHasher.hash('654321'),
      }),
    )
    expect(inMemoryDeliveryMansRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Pedro',
        password: await fakeHasher.hash('654321'),
      }),
    )
  })

  it('should not be able to edit a delivery man from another delivery man', async () => {
    const deliveryMan = makeDeliveryMan()

    await inMemoryDeliveryMansRepository.create(deliveryMan)

    const result = await sut.execute({
      deliveryManId: 'delivery-man-2',
      name: 'Pedro',
      password: '123456',
      newPassword: '654321',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to edit a delivery person if their current password is incorrect.', async () => {
    const deliveryMan = makeDeliveryMan({
      password: await fakeHasher.hash('123456'),
    })

    await inMemoryDeliveryMansRepository.create(deliveryMan)

    const result = await sut.execute({
      deliveryManId: deliveryMan.id.toString(),
      name: 'New name',
      password: '123',
      newPassword: '654321',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
