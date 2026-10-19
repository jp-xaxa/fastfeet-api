import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'

import { OrderFactory } from '@/test/factories/make-order.js'
import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { DeliveryManFactory } from '@/test/factories/make-delivery-man.js'

describe('Fetch Delivery Man Orders (E2E)', () => {
  let app: INestApplication
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

    orderFactory = moduleRef.get(OrderFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    deliveryManFactory = moduleRef.get(DeliveryManFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /delivery-man/orders', async () => {
    const [deliveryMan, anotherDeliveryMan] = await Promise.all([
      deliveryManFactory.makePrismaDeliveryMan(),
      deliveryManFactory.makePrismaDeliveryMan(),
    ])

    const accessToken = jwt.sign({
      sub: deliveryMan.id.toString(),
      role: 'DELIVERY_MAN',
    })

    const recipient = await recipientFactory.makePrismaRecipient()

    const [order1, order2, anotherDeliveryManOrder] = await Promise.all([
      orderFactory.makePrismaOrder({
        recipientId: recipient.id,
        deliveryManId: deliveryMan.id,
      }),
      orderFactory.makePrismaOrder({
        recipientId: recipient.id,
        deliveryManId: deliveryMan.id,
      }),
      orderFactory.makePrismaOrder({
        recipientId: recipient.id,
        deliveryManId: anotherDeliveryMan.id,
      }),
    ])

    const response = await request(app.getHttpServer())
      .get('/delivery-man/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.orders).toHaveLength(2)
    expect(response.body).toEqual({
      orders: expect.arrayContaining([
        expect.objectContaining({
          id: order1.id.toString(),
          deliveryManId: deliveryMan.id.toString(),
        }),
        expect.objectContaining({
          id: order2.id.toString(),
          deliveryManId: deliveryMan.id.toString(),
        }),
      ]),
    })
    expect(response.body.orders).not.toContainEqual(
      expect.objectContaining({
        id: anotherDeliveryManOrder.id.toString(),
      }),
    )
  })
})
