import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { cpf } from 'cpf-cnpj-validator'

import { AppModule } from '../../app.module.js'
import { PrismaService } from '../../database/prisma/prisma.service.js'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sessions (delivery man)', async () => {
    const cpfGenerate = cpf.generate(true)

    await prisma.user.create({
      data: {
        name: 'João Pedro',
        cpf: cpfGenerate,
        password: await hash('123456', 8),
        role: 'DELIVERY_MAN',
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      cpf: cpfGenerate,
      password: '123456',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })

  test('[POST] /sessions (administrator)', async () => {
    const cpfGenerate = cpf.generate(true)

    await prisma.user.create({
      data: {
        name: 'Admin',
        cpf: cpfGenerate,
        password: await hash('123456', 8),
        role: 'ADMINISTRATOR',
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      cpf: cpfGenerate,
      password: '123456',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })

  test('[POST] /sessions (wrong password)', async () => {
    const cpfGenerate = cpf.generate(true)

    const response = await request(app.getHttpServer()).post('/sessions').send({
      cpf: cpfGenerate,
      password: 'wrong-password',
    })

    expect(response.statusCode).toBe(401)
  })
})
