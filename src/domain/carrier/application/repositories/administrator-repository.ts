import { Administrator } from '@/domain/carrier/enterprise/entities/administrator.js'

export abstract class AdministratorsRepository {
  abstract findById(id: string): Promise<Administrator | null>
  abstract findByCpf(cpf: string): Promise<Administrator | null>
  abstract save(question: Administrator): Promise<void>
  abstract create(question: Administrator): Promise<void>
  abstract delete(question: Administrator): Promise<void>
}
