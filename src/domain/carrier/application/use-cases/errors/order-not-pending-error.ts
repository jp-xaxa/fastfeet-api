import { UseCaseError } from '@/core/errors/use-case-error.js'

export class OrderNotPendingError extends Error implements UseCaseError {
  constructor(orderId: string) {
    super(`Order "${orderId}" is not pending and cannot be marked as waiting.`)
  }
}
