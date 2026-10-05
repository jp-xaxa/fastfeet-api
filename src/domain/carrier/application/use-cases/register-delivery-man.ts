import { Injectable } from '@nestjs/common'
import { Either, right, left } from '@/core/either.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'
import { DeliveryMansRepository } from '../repositories/delivery-man-repository.js'
import { AdministratorsRepository } from '../repositories/administrator-repository.js'
import { CpfAlreadyInUseError } from './errors/cpf-already-in-use-error.js'
import { HashGenerator } from '../cryptography/hash-generator.js'

interface RegisterDeliveryManUseCaseRequest {
  name: string
  cpf: string
  password: string
}

type RegisterDeliveryManUseCaseResponse = Either<
  CpfAlreadyInUseError,
  {
    deliveryMan: DeliveryMan
  }
>

@Injectable()
export class RegisterDeliveryManUseCase {
  constructor(
    private deliveryMansRepository: DeliveryMansRepository,
    private administratorsRepository: AdministratorsRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    cpf,
    password,
  }: RegisterDeliveryManUseCaseRequest): Promise<RegisterDeliveryManUseCaseResponse> {
    // O CPF é único entre todos os usuários, não só entre entregadores.
    const [deliveryManWithSameCpf, administratorWithSameCpf] =
      await Promise.all([
        this.deliveryMansRepository.findByCpf(cpf),
        this.administratorsRepository.findByCpf(cpf),
      ])

    if (deliveryManWithSameCpf || administratorWithSameCpf) {
      return left(new CpfAlreadyInUseError(cpf))
    }

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
