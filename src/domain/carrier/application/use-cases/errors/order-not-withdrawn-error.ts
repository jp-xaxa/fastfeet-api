import { UseCaseError } from '@/core/errors/use-case-error.js'

export class OrderNotWithdrawnError extends Error implements UseCaseError {
  constructor(orderId: string) {
    super(
      `Order "${orderId}" is not withdrawn and cannot be marked as delivered.`,
    )
  }
}
