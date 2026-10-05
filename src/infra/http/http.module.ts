import { Module } from '@nestjs/common'

import { RegisterAccountController } from './controllers/register-account.controller.js'
import { DatabaseModule } from '../database/database.module.js'
import { RegisterDeliveryManUseCase } from '@/domain/carrier/application/use-cases/register-delivery-man.js'
import { CryptographyModule } from '../cryptography/cryptography.module.js'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [RegisterAccountController],
  providers: [RegisterDeliveryManUseCase],
})
export class HttpModule {}
