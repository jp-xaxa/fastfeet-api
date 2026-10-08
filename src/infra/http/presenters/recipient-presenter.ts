import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'

export class RecipientPresenter {
  static toHTTP(recipient: Recipient) {
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      street: recipient.street,
      neighborhood: recipient.neighborhood,
      number: recipient.number ?? null,
      complement: recipient.complement ?? null,
      cep: recipient.cep,
      uf: recipient.uf,
    }
  }
}
