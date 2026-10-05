import { existsSync } from 'node:fs'
import { NestFactory } from '@nestjs/core'
import { AppModule, ObserveInstrument } from './app.module.js'
import { EnvService } from './env/env.service.js'

// Carrega o `.env` antes do bootstrap, para o PrismaService enxergar DATABASE_URL.
if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  })

  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  await app.listen(port)
}
await bootstrap()
