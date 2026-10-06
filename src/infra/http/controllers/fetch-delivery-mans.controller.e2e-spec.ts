import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'

import { DeliveryManFactory } from '@/test/factories/make-delivery-man.js'
import { AdministratorFactory } from '@/test/factories/make-administrator.js'

describe('Fetch delivery man (E2E)', () => {
  let app: INestApplication
  let deliveryManFactory: DeliveryManFactory
  let administratorFactory: AdministratorFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [DeliveryManFactory, AdministratorFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    deliveryManFactory = moduleRef.get(DeliveryManFactory)
    administratorFactory = moduleRef.get(AdministratorFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /delivery-man', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    await Promise.all([
      deliveryManFactory.makePrismaDeliveryMan({
        name: 'João',
      }),
      deliveryManFactory.makePrismaDeliveryMan({
        name: 'Pedro',
      }),
    ])

    const response = await request(app.getHttpServer())
      .get('/delivery-man')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      deliveryMans: expect.arrayContaining([
        expect.objectContaining({ name: 'João' }),
        expect.objectContaining({ name: 'Pedro' }),
      ]),
    })
  })
})
