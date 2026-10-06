import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { hash, compare } from 'bcryptjs'

import { AppModule } from '@/infra/app.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'

import { DeliveryManFactory } from '@/test/factories/make-delivery-man.js'
import { AdministratorFactory } from '@/test/factories/make-administrator.js'

describe('Edit delivery man (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let deliveryManFactory: DeliveryManFactory
  let administratorFactory: AdministratorFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [DeliveryManFactory, AdministratorFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    deliveryManFactory = moduleRef.get(DeliveryManFactory)
    administratorFactory = moduleRef.get(AdministratorFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /delivery-man/:id', async () => {
    const administrator = await administratorFactory.makePrismaAdministrator()

    const accessToken = jwt.sign({
      sub: administrator.id.toString(),
      role: 'ADMINISTRATOR',
    })

    const deliveryMan = await deliveryManFactory.makePrismaDeliveryMan({
      name: 'João',
      cpf: '453.164.232-59',
      password: await hash('123456', 8),
    })

    const deliveryManId = deliveryMan.id.toString()

    const response = await request(app.getHttpServer())
      .put(`/delivery-man/${deliveryManId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Pedro',
        password: '123456',
        newPassword: '654321',
      })

    expect(response.statusCode).toBe(204)

    const deliveryManOnDatabase = await prisma.user.findUnique({
      where: { id: deliveryManId },
    })

    expect(deliveryManOnDatabase).toBeTruthy()
    expect(deliveryManOnDatabase?.name).toBe('Pedro')
    expect(await compare('654321', deliveryManOnDatabase!.password)).toBe(true)
  })
})
