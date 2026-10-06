import { FetchDeliveryMansUseCase } from './fetch-delivery-mans.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { makeDeliveryMan } from '@/test/factories/make-delivery-man.js'

let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository

let sut: FetchDeliveryMansUseCase

describe('Fetch Delivery Mans', () => {
  beforeEach(() => {
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()

    sut = new FetchDeliveryMansUseCase(inMemoryDeliveryMansRepository)
  })

  it('should be able to fetch delivery mans', async () => {
    const deliveryMan1 = makeDeliveryMan({
      cpf: '728.716.032-35',
    })
    const deliveryMan2 = makeDeliveryMan({
      cpf: '139.317.752-24',
    })
    const deliveryMan3 = makeDeliveryMan({
      cpf: '558.065.667-06',
    })

    inMemoryDeliveryMansRepository.create(deliveryMan1)
    inMemoryDeliveryMansRepository.create(deliveryMan2)
    inMemoryDeliveryMansRepository.create(deliveryMan3)

    const result = await sut.execute({
      page: 1,
    })

    expect(result.value?.deliveryMans).toHaveLength(3)
    expect(result.value?.deliveryMans).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cpf: '728.716.032-35',
        }),
        expect.objectContaining({
          cpf: '139.317.752-24',
        }),
        expect.objectContaining({
          cpf: '558.065.667-06',
        }),
      ]),
    )
  })

  it('should be able to fetch paginated delivery mans', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryDeliveryMansRepository.create(makeDeliveryMan())
    }

    const result = await sut.execute({
      page: 2,
    })

    expect(result.value?.deliveryMans).toHaveLength(2)
  })
})
