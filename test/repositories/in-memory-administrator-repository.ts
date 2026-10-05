import { AdministratorsRepository } from '@/domain/carrier/application/repositories/administrator-repository.js'
import { Administrator } from '@/domain/carrier/enterprise/entities/administrator.js'

export class InMemoryAdministratorsRepository implements AdministratorsRepository {
  public items: Administrator[] = []

  async findById(id: string) {
    const administrator = this.items.find((item) => item.id.toString() === id)

    if (!administrator) {
      return null
    }

    return administrator
  }

  async findByCpf(cpf: string) {
    const administrator = this.items.find((item) => item.cpf === cpf)

    if (!administrator) {
      return null
    }

    return administrator
  }

  async create(administrator: Administrator) {
    this.items.push(administrator)
  }

  async save(administrator: Administrator) {
    const itemIndex = this.items.findIndex(
      (item) => item.id === administrator.id,
    )

    this.items[itemIndex] = administrator
  }

  async delete(administrator: Administrator) {
    const itemIndex = this.items.findIndex(
      (item) => item.id === administrator.id,
    )

    this.items.splice(itemIndex, 1)
  }
}
