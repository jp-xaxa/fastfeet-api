import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '../../app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

import { AdministratorFactory } from '@/test/factories/make-administrator.js'
import { RecipientFactory } from '@/test/factories/make-recipient.js'

describe('Create Order (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let administratorFactory: AdministratorFactory
  let recipientFactory: RecipientFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AdministratorFactory, RecipientFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    administratorFactory = moduleRef.get(AdministratorFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /order', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()
    const recipient = await recipientFactory.makePrismaRecipient()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .post('/order')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        recipientId: recipient.id.toString(),
      })

    expect(response.statusCode).toBe(201)

    const orderOnDatabase = await prisma.order.findUnique({
      where: {
        id: response.body.id,
      },
    })

    expect(orderOnDatabase).toBeTruthy()
  })
})
