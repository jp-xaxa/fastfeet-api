import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import {
  Administrator,
  AdministratorProps,
} from '@/domain/carrier/enterprise/entities/administrator.js'

export function makeAdministrator(
  override: Partial<AdministratorProps> = {},
  id?: UniqueEntityID,
) {
  const administrator = Administrator.create(
    {
      name: faker.person.fullName(),
      cpf: faker.string.numeric(11),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )

  return administrator
}
