import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import {
  DeliveryMan,
  DeliveryManProps,
} from '@/domain/carrier/enterprise/entities/delivery-man.js'

export function makeDeliveryMan(
  override: Partial<DeliveryManProps> = {},
  id?: UniqueEntityID,
) {
  const deliveryMan = DeliveryMan.create(
    {
      name: faker.person.fullName(),
      cpf: faker.string.numeric(11),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )

  return deliveryMan
}
