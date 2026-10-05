import { AppModule } from '../../app.module.js'
import { PrismaService } from '../../database/prisma/prisma.service.js'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { cpf } from 'cpf-cnpj-validator'

describe('Register Account (E2E)', () => {
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

  test('[POST] /accounts', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${administratorToken}`)
      .send({
        name: 'João Pedro',
        cpf: '529.982.247-25',
        password: '123456',
      })

    expect(response.statusCode).toBe(201)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: '52998224725',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })

  test('[POST] /accounts (cpf already in use by an administrator)', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${administratorToken}`)
      .send({
        name: 'João Pedro',
        cpf: cpf.format(administratorCpf),
        password: '123456',
      })

    expect(response.statusCode).toBe(409)
  })

  test('[POST] /accounts (delivery man is not allowed)', async () => {
    const deliveryMan = await prisma.user.create({
      data: {
        name: 'Entregador',
        cpf: cpf.generate(),
        password: await hash('123456', 8),
        role: 'DELIVERY_MAN',
      },
    })

    const deliveryManToken = jwt.sign({
      sub: deliveryMan.id,
      role: 'DELIVERY_MAN',
    })

    const response = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${deliveryManToken}`)
      .send({
        name: 'João Pedro',
        cpf: cpf.generate(),
        password: '123456',
      })

    expect(response.statusCode).toBe(403)
  })
})
