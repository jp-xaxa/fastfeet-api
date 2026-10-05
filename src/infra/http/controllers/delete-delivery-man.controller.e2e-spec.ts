import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { cpf } from 'cpf-cnpj-validator'

import { AppModule } from '../../app.module.js'
import { PrismaService } from '../../database/prisma/prisma.service.js'

describe('Delete Delivery Man (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  let administratorCpf: string
  let administratorToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()

    administratorCpf = cpf.generate()

    const administrator = await prisma.user.create({
      data: {
        name: 'Admin',
        cpf: administratorCpf,
        password: await hash('123456', 8),
        role: 'ADMINISTRATOR',
      },
    })

    administratorToken = jwt.sign({
      sub: administrator.id,
      role: 'ADMINISTRATOR',
    })
  })

  test('[DELETE] /delivery-man/:id', async () => {
    const createDeliveryMan = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${administratorToken}`)
      .send({
        name: 'João Pedro',
        cpf: '529.982.247-25',
        password: '123456',
      })

    expect(createDeliveryMan.statusCode).toBe(201)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: '52998224725',
      },
    })

    expect(userOnDatabase).toBeTruthy()

    const deliveryManId = userOnDatabase?.id

    const response = await request(app.getHttpServer())
      .delete(`/delivery-man/${deliveryManId}`)
      .set('Authorization', `Bearer ${administratorToken}`)
      .send({
        name: 'João Pedro',
        cpf: '529.982.247-25',
        password: '123456',
      })

    expect(response.statusCode).toBe(204)

    const deliveryManOnDatabase = await prisma.user.findUnique({
      where: {
        id: deliveryManId,
      },
    })

    expect(deliveryManOnDatabase).toBeNull()
  })
})
