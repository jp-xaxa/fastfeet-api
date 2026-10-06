import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'
import { DeliveryMansRepository } from '../repositories/delivery-man-repository.js'
import { HashComparer } from '../cryptography/hash-comparer.js'
import { HashGenerator } from '../cryptography/hash-generator.js'
import { WrongCredentialsError } from './errors/wrong-credentials-error.js'

interface EditDeliveryManUseCaseRequest {
  deliveryManId: string
  name: string
  password: string
  newPassword: string
}

type EditDeliveryManUseCaseResponse = Either<
  ResourceNotFoundError | WrongCredentialsError,
  {
    deliveryMan: DeliveryMan
  }
>

@Injectable()
export class EditDeliveryManUseCase {
  constructor(
    private deliveryMansRepository: DeliveryMansRepository,
    private hashComparer: HashComparer,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    deliveryManId,
    name,
    password,
    newPassword,
  }: EditDeliveryManUseCaseRequest): Promise<EditDeliveryManUseCaseResponse> {
    const deliveryMan =
      await this.deliveryMansRepository.findById(deliveryManId)

    if (!deliveryMan) {
      return left(new ResourceNotFoundError())
    }

    const isCurrentPasswordValid = await this.hashComparer.compare(
      password,
      deliveryMan.password,
    )

    if (!isCurrentPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const hashedNewPassword = await this.hashGenerator.hash(newPassword)

    deliveryMan.name = name
    deliveryMan.password = hashedNewPassword

    await this.deliveryMansRepository.save(deliveryMan)

    return right({
      deliveryMan,
    })
  }
}
