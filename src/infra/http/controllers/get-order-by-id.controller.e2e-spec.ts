import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'

import { OrderFactory } from '@/test/factories/make-order.js'
import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { DeliveryManFactory } from '@/test/factories/make-delivery-man.js'
import { AdministratorFactory } from '@/test/factories/make-administrator.js'

describe('Get order by id (E2E)', () => {
  let app: INestApplication
  let orderFactory: OrderFactory
  let recipientFactory: RecipientFactory
  let deliveryManFactory: DeliveryManFactory
  let administratorFactory: AdministratorFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        OrderFactory,
        RecipientFactory,
        DeliveryManFactory,
        AdministratorFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    orderFactory = moduleRef.get(OrderFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    deliveryManFactory = moduleRef.get(DeliveryManFactory)
    administratorFactory = moduleRef.get(AdministratorFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /order/:id', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const [recipient, deliveryMan] = await Promise.all([
      recipientFactory.makePrismaRecipient({
        name: 'João',
        street: 'Rua Brasil',
        neighborhood: 'Centro',
        number: 1,
        complement: null,
        cep: '36455-000',
        uf: 'MG',
      }),
      deliveryManFactory.makePrismaDeliveryMan({
        name: 'Pedro',
      }),
    ])

    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
      deliveryManId: deliveryMan.id,
    })

    const orderId = order.id.toString()

    const response = await request(app.getHttpServer())
      .get(`/order/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      order: expect.objectContaining({
        id: orderId,
        recipient: expect.objectContaining({
          id: recipient.id.toString(),
          name: 'João',
          street: 'Rua Brasil',
          neighborhood: 'Centro',
          number: 1,
          complement: null,
          cep: '36455-000',
          uf: 'MG',
        }),
        deliveryMan: {
          id: deliveryMan.id.toString(),
          name: 'Pedro',
        },
      }),
    })
  })
})
