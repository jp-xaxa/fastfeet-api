import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either.js'
import { Administrator } from '@/domain/carrier/enterprise/entities/administrator.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'
import { AdministratorsRepository } from '../repositories/administrator-repository.js'
import { DeliveryMansRepository } from '../repositories/delivery-man-repository.js'
import { HashComparer } from '../cryptography/hash-comparer.js'
import { Encrypter } from '../cryptography/encrypter.js'
import { WrongCredentialsError } from './errors/wrong-credentials-error.js'

export type UserRole = 'ADMINISTRATOR' | 'DELIVERY_MAN'

interface AuthenticateUsersUseCaseRequest {
  cpf: string
  password: string
}

type AuthenticateUsersUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>

interface UserWithRole {
  user: Administrator | DeliveryMan
  role: UserRole
}

@Injectable()
export class AuthenticateUsersUseCase {
  constructor(
    private administratorsRepository: AdministratorsRepository,
    private deliveryMansRepository: DeliveryMansRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    cpf,
    password,
  }: AuthenticateUsersUseCaseRequest): Promise<AuthenticateUsersUseCaseResponse> {
    const userWithRole = await this.findUserByCpf(cpf)

    if (!userWithRole) {
      return left(new WrongCredentialsError())
    }

    const { user, role } = userWithRole

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      role,
    })

    return right({
      accessToken,
    })
  }

  private async findUserByCpf(cpf: string): Promise<UserWithRole | null> {
    const administrator = await this.administratorsRepository.findByCpf(cpf)

    if (administrator) {
      return { user: administrator, role: 'ADMINISTRATOR' }
    }

    const deliveryMan = await this.deliveryMansRepository.findByCpf(cpf)

    if (deliveryMan) {
      return { user: deliveryMan, role: 'DELIVERY_MAN' }
    }

    return null
  }
}
