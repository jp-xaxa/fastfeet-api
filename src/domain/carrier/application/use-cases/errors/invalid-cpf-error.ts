import { UseCaseError } from '@/core/errors/use-case-error.js'

export class InvalidCpfError extends Error implements UseCaseError {
  constructor(cpf: string) {
    super(`CPF "${cpf}" are not valid.`)
  }
}
