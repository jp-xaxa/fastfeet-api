import { MockInstance } from 'vitest'

import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { OnOrderStatusUpdated } from '@/domain/notification/application/subscribers/on-order-status-updated.js'
import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '../use-cases/send-notification.js'

import { waitFor } from '@/test/utils/wait-for.js'
import { makeOrder } from '@/test/factories/make-order.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'
import { InMemoryOrdersRepository } from '@/test/repositories/in-memory-order-repository.js'
import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryDeliveryMansRepository } from '@/test/repositories/in-memory-delivery-man-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryMansRepository: InMemoryDeliveryMansRepository
let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest,
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On Order Status Updated', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryDeliveryMansRepository = new InMemoryDeliveryMansRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryRecipientsRepository,
      inMemoryDeliveryMansRepository,
    )
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnOrderStatusUpdated(
      inMemoryRecipientsRepository,
      sendNotificationUseCase,
    )
  })

  it('should send a notification when an order is marked as waiting', async () => {
    const recipient = makeRecipient()
    const order = makeOrder({ recipientId: recipient.id })

    inMemoryRecipientsRepository.create(recipient)
    inMemoryOrdersRepository.create(order)

    order.markAsWaiting()
    inMemoryOrdersRepository.save(order)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: recipient.id.toString(),
          title: 'Encomenda aguardando retirada',
        }),
      )
    })
  })

  it('should send a notification when an order is marked as withdrawn', async () => {
    const recipient = makeRecipient()
    const order = makeOrder({
      recipientId: recipient.id,
      waitingAt: new Date(),
    })

    inMemoryRecipientsRepository.create(recipient)
    inMemoryOrdersRepository.create(order)

    order.markAsWithdrawn(new UniqueEntityID('delivery-man-1'))
    inMemoryOrdersRepository.save(order)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: recipient.id.toString(),
          title: 'Encomenda saiu para entrega',
        }),
      )
    })
  })

  it('should send a notification when an order is marked as delivered', async () => {
    const deliveryManId = new UniqueEntityID('delivery-man-1')
    const recipient = makeRecipient()
    const order = makeOrder({
      recipientId: recipient.id,
      deliveryManId,
      waitingAt: new Date(),
      withdrawnAt: new Date(),
    })

    inMemoryRecipientsRepository.create(recipient)
    inMemoryOrdersRepository.create(order)

    order.markAsDelivered(deliveryManId, new UniqueEntityID('photo-1'))
    inMemoryOrdersRepository.save(order)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: recipient.id.toString(),
          title: 'Encomenda entregue',
        }),
      )
    })
  })

  it('should send a notification with the reason when an order is marked as returned', async () => {
    const recipient = makeRecipient()
    const order = makeOrder({
      recipientId: recipient.id,
      deliveryManId: new UniqueEntityID('delivery-man-1'),
      waitingAt: new Date(),
      withdrawnAt: new Date(),
    })

    inMemoryRecipientsRepository.create(recipient)
    inMemoryOrdersRepository.create(order)

    order.markAsReturned('Destinatário ausente')
    inMemoryOrdersRepository.save(order)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalledWith({
        recipientId: recipient.id.toString(),
        title: 'Encomenda devolvida',
        content: 'Sua encomenda foi devolvida. Motivo: Destinatário ausente',
      })
    })
  })

  it('should not send a notification when the order is created', async () => {
    const recipient = makeRecipient()
    const order = makeOrder({ recipientId: recipient.id })

    inMemoryRecipientsRepository.create(recipient)
    await inMemoryOrdersRepository.create(order)

    expect(sendNotificationExecuteSpy).not.toHaveBeenCalled()
  })
})
