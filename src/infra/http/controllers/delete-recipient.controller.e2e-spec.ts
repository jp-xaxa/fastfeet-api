import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '../../app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { AdministratorFactory } from '@/test/factories/make-administrator.js'

describe('Delete Recipient (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let recipientFactory: RecipientFactory
  let administratorFactory: AdministratorFactory
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

  test('[DELETE] /recipient/:id', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const recipient = await recipientFactory.makePrismaRecipient()

    const recipientId = recipient.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/recipient/${recipientId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const deliveryManOnDatabase = await prisma.recipient.findUnique({
      where: {
        id: recipientId,
      },
    })

    expect(deliveryManOnDatabase).toBeNull()
  })
})
