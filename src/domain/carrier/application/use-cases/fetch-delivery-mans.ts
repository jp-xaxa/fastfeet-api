import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either.js'
import { DeliveryMan } from '@/domain/carrier/enterprise/entities/delivery-man.js'
import { DeliveryMansRepository } from '../repositories/delivery-man-repository.js'

interface FetchDeliveryMansUseCaseRequest {
  page: number
}

type FetchDeliveryMansUseCaseResponse = Either<
  null,
  {
    deliveryMans: DeliveryMan[]
  }
>

@Injectable()
export class FetchDeliveryMansUseCase {
  constructor(private deliveryMansRepository: DeliveryMansRepository) {}

  async execute({
    page,
  }: FetchDeliveryMansUseCaseRequest): Promise<FetchDeliveryMansUseCaseResponse> {
    const deliveryMans = await this.deliveryMansRepository.findMany({
      page,
    })

    return right({
      deliveryMans,
    })
  }
}
