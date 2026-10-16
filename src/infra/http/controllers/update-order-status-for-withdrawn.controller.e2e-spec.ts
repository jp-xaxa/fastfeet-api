import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

import { OrderFactory } from '@/test/factories/make-order.js'
import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { AdministratorFactory } from '@/test/factories/make-administrator.js'
import { DeliveryManFactory } from '@/test/factories/make-delivery-man.js'

describe('Update Order Status for Withdrawn (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let orderFactory: OrderFactory
  let recipientFactory: RecipientFactory
  let administratorFactory: AdministratorFactory
  let deliveryManFactory: DeliveryManFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        OrderFactory,
        RecipientFactory,
        AdministratorFactory,
        DeliveryManFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    orderFactory = moduleRef.get(OrderFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    administratorFactory = moduleRef.get(AdministratorFactory)
    deliveryManFactory = moduleRef.get(DeliveryManFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PATCH] /order/:id/status-for-withdrawn', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const deliveryMan = await deliveryManFactory.makePrismaDeliveryMan()

    const recipient = await recipientFactory.makePrismaRecipient()

    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
      waitingAt: new Date(),
    })

    const orderId = order.id.toString()

    const requestStartedAt = new Date()

    const response = await request(app.getHttpServer())
      .patch(`/order/${orderId}/status-for-withdrawn`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        deliveryManId: deliveryMan.id.toString(),
      })

    const requestFinishedAt = new Date()

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    })

    expect(orderOnDatabase).toBeTruthy()
    expect(orderOnDatabase?.deliveryManId).toEqual(deliveryMan.id.toString())
    expect(orderOnDatabase?.withdrawnAt).toBeInstanceOf(Date)
    expect(orderOnDatabase?.withdrawnAt?.getTime()).toBeGreaterThanOrEqual(
      requestStartedAt.getTime(),
    )
    expect(orderOnDatabase?.withdrawnAt?.getTime()).toBeLessThanOrEqual(
      requestFinishedAt.getTime(),
    )
  })
})
