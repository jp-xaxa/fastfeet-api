import { FetchRecipientNotificationsUseCase } from './fetch-recipient-notifications.js'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

import { InMemoryRecipientsRepository } from '@/test/repositories/in-memory-recipient-repository.js'
import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory-notifications-repository.js'
import { makeRecipient } from '@/test/factories/make-recipient.js'
import { makeNotification } from '@/test/factories/make-notification.js'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository

let sut: FetchRecipientNotificationsUseCase

describe('Fetch Recipient Notifications', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()

    sut = new FetchRecipientNotificationsUseCase(
      inMemoryRecipientsRepository,
      inMemoryNotificationsRepository,
    )
  })

  it('should be able to fetch only the notifications of the recipient', async () => {
    const recipient = makeRecipient()
    const anotherRecipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryRecipientsRepository.create(anotherRecipient)

    const notification1 = makeNotification({ recipientId: recipient.id })
    const notification2 = makeNotification({ recipientId: recipient.id })

    await inMemoryNotificationsRepository.create(notification1)
    await inMemoryNotificationsRepository.create(notification2)
    await inMemoryNotificationsRepository.create(
      makeNotification({ recipientId: anotherRecipient.id }),
    )

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      notifications: expect.arrayContaining([
        expect.objectContaining({ id: notification1.id }),
        expect.objectContaining({ id: notification2.id }),
      ]),
    })
    if (result.isRight()) {
      expect(result.value.notifications).toHaveLength(2)
    }
  })

  it('should return the most recent notifications first', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    const oldestNotification = makeNotification({
      recipientId: recipient.id,
      createdAt: new Date(2026, 0, 1),
    })
    const newestNotification = makeNotification({
      recipientId: recipient.id,
      createdAt: new Date(2026, 0, 3),
    })
    const middleNotification = makeNotification({
      recipientId: recipient.id,
      createdAt: new Date(2026, 0, 2),
    })

    await inMemoryNotificationsRepository.create(oldestNotification)
    await inMemoryNotificationsRepository.create(newestNotification)
    await inMemoryNotificationsRepository.create(middleNotification)

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
      page: 1,
    })

    expect(result.value).toEqual({
      notifications: [
        expect.objectContaining({ id: newestNotification.id }),
        expect.objectContaining({ id: middleNotification.id }),
        expect.objectContaining({ id: oldestNotification.id }),
      ],
    })
  })

  it('should be able to fetch paginated recipient notifications', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    for (let i = 1; i <= 22; i++) {
      await inMemoryNotificationsRepository.create(
        makeNotification({ recipientId: recipient.id }),
      )
    }

    const result = await sut.execute({
      recipientId: recipient.id.toString(),
      page: 2,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.notifications).toHaveLength(2)
    }
  })

  it('should not be able to fetch notifications of a recipient that does not exist', async () => {
    const result = await sut.execute({
      recipientId: 'recipient-1',
      page: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
