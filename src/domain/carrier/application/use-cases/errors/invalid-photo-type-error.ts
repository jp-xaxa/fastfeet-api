import { UseCaseError } from '@/core/errors/use-case-error.js'

export class InvalidPhotoTypeError extends Error implements UseCaseError {
  constructor(type: string) {
    super(`File type "${type}" is not a valid photo.`)
  }
}
