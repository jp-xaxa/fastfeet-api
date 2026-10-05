import { InMemoryAdministratorsRepository } from '@/test/repositories/in-memory-administrator-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { FakeHasher } from '@/test/cryptography/fake-hasher.js'
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter.js'
import { makeAdministrator } from '@/test/factories/make-administrator.js'
import { makeDeliveryMan } from '@/test/factories/make-delivery-man.js'
import { AuthenticateUsersUseCase } from './authenticate-users.js'
import { WrongCredentialsError } from './errors/wrong-credentials-error.js'

let inMemoryAdministratorsRepository: InMemoryAdministratorsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter

let sut: AuthenticateUsersUseCase

describe('Authenticate Users', () => {
  beforeEach(() => {
    inMemoryAdministratorsRepository = new InMemoryAdministratorsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()

    sut = new AuthenticateUsersUseCase(
      inMemoryAdministratorsRepository,
      inMemoryDeliveryMansRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able to authenticate a delivery man', async () => {
    const deliveryMan = makeDeliveryMan({
      cpf: '52998224725',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryDeliveryMansRepository.items.push(deliveryMan)

    const result = await sut.execute({
      cpf: '52998224725',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })

    if (result.isRight()) {
      const payload = JSON.parse(result.value.accessToken)

      expect(payload).toEqual({
        sub: deliveryMan.id.toString(),
        role: 'DELIVERY_MAN',
      })
    }
  })

  it('should be able to authenticate an administrator', async () => {
    const administrator = makeAdministrator({
      cpf: '52998224725',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryAdministratorsRepository.items.push(administrator)

    const result = await sut.execute({
      cpf: '52998224725',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      const payload = JSON.parse(result.value.accessToken)

      expect(payload).toEqual({
        sub: administrator.id.toString(),
        role: 'ADMINISTRATOR',
      })
    }
  })

  it('should not be able to authenticate with wrong password', async () => {
    const deliveryMan = makeDeliveryMan({
      cpf: '52998224725',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryDeliveryMansRepository.items.push(deliveryMan)

    const result = await sut.execute({
      cpf: '52998224725',
      password: '123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not be able to authenticate a non-existent user', async () => {
    const result = await sut.execute({
      cpf: '52998224725',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
