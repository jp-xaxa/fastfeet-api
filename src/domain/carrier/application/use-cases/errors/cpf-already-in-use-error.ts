import { UseCaseError } from '@/core/errors/use-case-error.js'

export class CpfAlreadyInUseError extends Error implements UseCaseError {
  constructor(cpf: string) {
    super(`CPF "${cpf}" is already in use.`)
  }
}
