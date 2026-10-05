import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { createObserveModule } from '@nestjs/observe'

import { AuthModule } from './auth/auth.module.js'
import { HttpModule } from './http/http.module.js'
import { EnvModule } from './env/env.module.js'
import { envSchema } from './env/env.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: '05-nest-clean',
    }),
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    HttpModule,
    EnvModule,
  ],
})
export class AppModule {}
