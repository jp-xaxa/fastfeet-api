import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

import { OrderFactory } from '@/test/factories/make-order.js'
import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { DeliveryManFactory } from '@/test/factories/make-delivery-man.js'

describe('Update Order Status for Delivered (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let orderFactory: OrderFactory
  let recipientFactory: RecipientFactory
  let deliveryManFactory: DeliveryManFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [OrderFactory, RecipientFactory, DeliveryManFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    orderFactory = moduleRef.get(OrderFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    deliveryManFactory = moduleRef.get(DeliveryManFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PATCH] /order/:id/status-for-delivered', async () => {
    const deliveryMan = await deliveryManFactory.makePrismaDeliveryMan()

    const accessToken = jwt.sign({
      sub: deliveryMan.id.toString(),
      role: 'DELIVERY_MAN',
    })

    const recipient = await recipientFactory.makePrismaRecipient()

    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
      deliveryManId: deliveryMan.id,
      waitingAt: new Date(),
      withdrawnAt: new Date(),
    })

    const orderId = order.id.toString()

    const requestStartedAt = new Date()

    const response = await request(app.getHttpServer())
      .patch(`/order/${orderId}/status-for-delivered`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('photo', './test/e2e/sample-upload.png')

    const requestFinishedAt = new Date()

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    })

    expect(orderOnDatabase).toBeTruthy()
    expect(orderOnDatabase?.deliveryAt).toBeInstanceOf(Date)
    expect(orderOnDatabase?.deliveryAt?.getTime()).toBeGreaterThanOrEqual(
      requestStartedAt.getTime(),
    )
    expect(orderOnDatabase?.deliveryAt?.getTime()).toBeLessThanOrEqual(
      requestFinishedAt.getTime(),
    )
    expect(orderOnDatabase?.photoId).toEqual(expect.any(String))

    const photoOnDatabase = await prisma.photo.findUnique({
      where: {
        id: orderOnDatabase?.photoId ?? '',
      },
    })

    expect(photoOnDatabase).toBeTruthy()
    expect(
      existsSync(
        join(process.env.STORAGE_PATH ?? '', photoOnDatabase?.url ?? ''),
      ),
    ).toBe(true)
  })
})
