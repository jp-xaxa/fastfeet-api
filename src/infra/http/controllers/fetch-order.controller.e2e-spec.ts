import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'

import { OrderFactory } from '@/test/factories/make-order.js'
import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { AdministratorFactory } from '@/test/factories/make-administrator.js'

describe('Fetch orders (E2E)', () => {
  let app: INestApplication
  let orderFactory: OrderFactory
  let recipientFactory: RecipientFactory
  let administratorFactory: AdministratorFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [OrderFactory, RecipientFactory, AdministratorFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    orderFactory = moduleRef.get(OrderFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    administratorFactory = moduleRef.get(AdministratorFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /order', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const recipient = await recipientFactory.makePrismaRecipient()

    const [order1, order2] = await Promise.all([
      orderFactory.makePrismaOrder({ recipientId: recipient.id }),
      orderFactory.makePrismaOrder({ recipientId: recipient.id }),
    ])

    const response = await request(app.getHttpServer())
      .get('/order')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      orders: expect.arrayContaining([
        expect.objectContaining({
          id: order1.id.toString(),
          recipientId: recipient.id.toString(),
          deliveryManId: null,
        }),
        expect.objectContaining({
          id: order2.id.toString(),
          recipientId: recipient.id.toString(),
          deliveryManId: null,
        }),
      ]),
    })
  })
})
