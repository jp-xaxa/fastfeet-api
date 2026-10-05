import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { InMemoryAdministratorsRepository } from '@/test/repositories/in-memory-administrator-repository.js'
import { FakeHasher } from '@/test/cryptography/fake-hasher.js'
import { makeDeliveryMan } from '@/test/factories/make-delivery-man.js'
import { makeAdministrator } from '@/test/factories/make-administrator.js'

import { RegisterDeliveryManUseCase } from './register-delivery-man.js'
import { CpfAlreadyInUseError } from './errors/cpf-already-in-use-error.js'

let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryAdministratorsRepository: InMemoryAdministratorsRepository
let fakeHasher: FakeHasher

let sut: RegisterDeliveryManUseCase

describe('Register Delivery Man', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryAdministratorsRepository = new InMemoryAdministratorsRepository()
    fakeHasher = new FakeHasher()

    sut = new RegisterDeliveryManUseCase(
      inMemoryDeliveryMansRepository,
      inMemoryAdministratorsRepository,
      fakeHasher,
    )
  })

  it('should be able to register a new delivery man', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      cpf: '52998224725',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      deliveryMan: inMemoryDeliveryMansRepository.items[0],
    })
  })

  it('should hash delivery man password upon registration', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      cpf: '52998224725',
      password: '123456',
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryDeliveryMansRepository.items[0].password).toEqual(
      hashedPassword,
    )
  })

  it('should not be able to register a delivery man with same cpf', async () => {
    inMemoryDeliveryMansRepository.items.push(
      makeDeliveryMan({ cpf: '52998224725' }),
    )

    const result = await sut.execute({
      name: 'John Doe',
      cpf: '52998224725',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CpfAlreadyInUseError)
  })

  it('should not be able to register a delivery man with an administrator cpf', async () => {
    inMemoryAdministratorsRepository.items.push(
      makeAdministrator({ cpf: '52998224725' }),
    )

    const result = await sut.execute({
      name: 'John Doe',
      cpf: '52998224725',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CpfAlreadyInUseError)
    expect(inMemoryDeliveryMansRepository.items).toHaveLength(0)
  })
})
