import { config } from 'dotenv'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { envSchema } from '@/infra/env/env.js'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const env = envSchema.parse(process.env)

function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable')
  }

  const url = new URL(env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()
const databaseURL = generateUniqueDatabaseURL(schemaId)

process.env.DATABASE_URL = databaseURL

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: databaseURL },
    { schema: schemaId },
  ),
})

beforeAll(async () => {
  execSync('npx prisma migrate deploy')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
