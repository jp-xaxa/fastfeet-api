import { UseCaseError } from '@/core/errors/use-case-error.js'

export class DeliveryManAlreadyExistsError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string) {
    super(`Delivery Man "${identifier}" already exists.`)
  }
}
