import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'
import { DeliveryMansRepository } from '../repositories/delivery-man-repository.js'
import { DeliveryManAlreadyExistsError } from './errors/delivery-man-already-exists-error.js'
// import { InvalidCpfError } from './errors/invalid-cpf-error.js'
import { HashGenerator } from '../cryptography/hash-generator.js'
// import { CpfValidator } from '../gateways/cpfValidator/cpf-validator.js'

interface RegisterDeliveryManUseCaseRequest {
  name: string
  cpf: string
  password: string
}

type RegisterDeliveryManUseCaseResponse = Either<
  DeliveryManAlreadyExistsError,
  {
    deliveryMan: DeliveryMan
  }
>

@Injectable()
export class RegisterDeliveryManUseCase {
  constructor(
    private deliveryMansRepository: DeliveryMansRepository,
    private hashGenerator: HashGenerator,
    // private cpfValidator: CpfValidator,
  ) {}

  async execute({
    name,
    cpf,
    password,
  }: RegisterDeliveryManUseCaseRequest): Promise<RegisterDeliveryManUseCaseResponse> {
    const deliveryManWithSameCpf =
      await this.deliveryMansRepository.findByCpf(cpf)

    if (deliveryManWithSameCpf) {
      return left(new DeliveryManAlreadyExistsError(cpf))
    }

    // const validCpf = await this.cpfValidator.validator(cpf)

    // if (!validCpf) {
    //   return left(new InvalidCpfError(cpf))
    // }

    const hashedPassword = await this.hashGenerator.hash(password)

    const deliveryMan = DeliveryMan.create({
      name,
      cpf,
      password: hashedPassword,
    })

    await this.deliveryMansRepository.create(deliveryMan)

    return right({
      deliveryMan,
    })
  }
}
