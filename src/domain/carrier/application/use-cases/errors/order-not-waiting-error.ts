import { UseCaseError } from '@/core/errors/use-case-error.js'

export class OrderNotWaitingError extends Error implements UseCaseError {
  constructor(orderId: string) {
    super(
      `Order "${orderId}" is not waiting and cannot be marked as withdrawn.`,
    )
  }
}
