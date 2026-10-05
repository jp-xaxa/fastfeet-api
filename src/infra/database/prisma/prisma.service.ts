import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client.js'

function getSchemaFromURL(connectionString: string) {
  return new URL(connectionString).searchParams.get('schema') ?? undefined
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error('A variável de ambiente DATABASE_URL não foi definida.')
    }

    super({
      adapter: new PrismaPg(
        { connectionString },
        { schema: getSchemaFromURL(connectionString) },
      ),
      log: ['warn', 'error'],
    })
  }

  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
