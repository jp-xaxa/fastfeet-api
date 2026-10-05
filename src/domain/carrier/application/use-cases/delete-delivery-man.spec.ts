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

  // it('should not be able to delete a answer from another user', async () => {
  //   const newAnswer = makeAnswer(
  //     {
  //       authorId: new UniqueEntityID('author-1'),
  //     },
  //     new UniqueEntityID('answer-1'),
  //   )

  //   await inMemoryAnswersRepository.create(newAnswer)

  //   const result = await sut.execute({
  //     answerId: 'answer-1',
  //     authorId: 'author-2',
  //   })

  //   expect(result.isLeft()).toBe(true)
  //   expect(result.value).toBeInstanceOf(NotAllowedError)
  // })
})
