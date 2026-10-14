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

describe('Delete Order (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
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

    prisma = moduleRef.get(PrismaService)
    orderFactory = moduleRef.get(OrderFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    administratorFactory = moduleRef.get(AdministratorFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[DELETE] /order/:id', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const recipient = await recipientFactory.makePrismaRecipient()

    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
    })

    const orderId = order.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/order/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const orderOnDatabase = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    })

    expect(orderOnDatabase).toBeNull()
  })
})
