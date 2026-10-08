import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'

import { RecipientFactory } from '@/test/factories/make-recipient.js'
import { AdministratorFactory } from '@/test/factories/make-administrator.js'

describe('Fetch recipient (E2E)', () => {
  let app: INestApplication
  let recipientFactory: RecipientFactory
  let administratorFactory: AdministratorFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [RecipientFactory, AdministratorFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    recipientFactory = moduleRef.get(RecipientFactory)
    administratorFactory = moduleRef.get(AdministratorFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /recipient', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    await Promise.all([
      recipientFactory.makePrismaRecipient({
        name: 'João',
        street: 'Rua Brasil',
        neighborhood: 'Centro',
        number: 1,
        complement: undefined,
        cep: '36455-000',
        uf: 'MG',
      }),
      recipientFactory.makePrismaRecipient({
        name: 'Pedro',
        street: 'Rua Cristal',
        neighborhood: 'Zona Norte',
        number: undefined,
        complement: 'Em frente a rotatória',
        cep: '39250-000',
        uf: 'MG',
      }),
    ])

    const response = await request(app.getHttpServer())
      .get('/recipient')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      recipients: expect.arrayContaining([
        expect.objectContaining({
          name: 'João',
          street: 'Rua Brasil',
          neighborhood: 'Centro',
          number: 1,
          complement: null,
          cep: '36455-000',
          uf: 'MG',
        }),
        expect.objectContaining({
          name: 'Pedro',
          street: 'Rua Cristal',
          neighborhood: 'Zona Norte',
          number: null,
          complement: 'Em frente a rotatória',
          cep: '39250-000',
          uf: 'MG',
        }),
      ]),
    })
  })
})
