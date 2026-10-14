import { UseCaseError } from '@/core/errors/use-case-error.js'

export class RecipientHasOrdersError extends Error implements UseCaseError {
  constructor(recipientId: string) {
    super(`Recipient "${recipientId}" has orders and cannot be deleted.`)
  }
}
