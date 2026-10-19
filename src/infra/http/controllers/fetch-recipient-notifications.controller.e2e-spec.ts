import { randomUUID } from 'node:crypto'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'

import { AdministratorFactory } from '@/test/factories/make-administrator.js'
import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { NotificationFactory } from '@/test/factories/make-notification.js'

describe('Fetch Recipient Notifications (E2E)', () => {
  let app: INestApplication
  let administratorFactory: AdministratorFactory
  let recipientFactory: RecipientFactory
  let notificationFactory: NotificationFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AdministratorFactory, RecipientFactory, NotificationFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    administratorFactory = moduleRef.get(AdministratorFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    notificationFactory = moduleRef.get(NotificationFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /recipient/:id/notifications', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const [recipient, anotherRecipient] = await Promise.all([
      recipientFactory.makePrismaRecipient(),
      recipientFactory.makePrismaRecipient(),
    ])

    const [notification1, notification2, anotherRecipientNotification] =
      await Promise.all([
        notificationFactory.makePrismaNotification({
          recipientId: recipient.id,
        }),
        notificationFactory.makePrismaNotification({
          recipientId: recipient.id,
        }),
        notificationFactory.makePrismaNotification({
          recipientId: anotherRecipient.id,
        }),
      ])

    const response = await request(app.getHttpServer())
      .get(`/recipient/${recipient.id.toString()}/notifications`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.notifications).toHaveLength(2)
    expect(response.body).toEqual({
      notifications: expect.arrayContaining([
        expect.objectContaining({
          id: notification1.id.toString(),
          title: notification1.title,
          readAt: null,
        }),
        expect.objectContaining({
          id: notification2.id.toString(),
          title: notification2.title,
          readAt: null,
        }),
      ]),
    })
    expect(response.body.notifications).not.toContainEqual(
      expect.objectContaining({
        id: anotherRecipientNotification.id.toString(),
      }),
    )
  })

  test('[GET] /recipient/:id/notifications (recipient not found)', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .get(`/recipient/${randomUUID()}/notifications`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(404)
  })
})
