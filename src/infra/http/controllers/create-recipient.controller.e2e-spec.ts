import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '../../app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

import { AdministratorFactory } from '@/test/factories/make-administrator.js'

describe('Create Recipient (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let administratorFactory: AdministratorFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AdministratorFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    administratorFactory = moduleRef.get(AdministratorFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /recipient', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .post('/recipient')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'João Pedro',
        street: 'Avenida Brasil',
        neighborhood: 'Rosário',
        number: 5,
        complement: 'Apart. 400',
        cep: '36450-000',
        uf: 'MG',
      })

    expect(response.statusCode).toBe(201)

    const recipientOnDatabase = await prisma.recipient.findFirst({
      where: {
        name: 'João Pedro',
      },
    })

    expect(recipientOnDatabase).toBeTruthy()
  })
})
