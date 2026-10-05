import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module.js'
import { CryptographyModule } from '../cryptography/cryptography.module.js'

import { RegisterAccountController } from './controllers/register-account.controller.js'
import { AuthenticateController } from './controllers/authenticate.controller.js'

import { RegisterDeliveryManUseCase } from '@/domain/carrier/application/use-cases/register-delivery-man.js'
import { AuthenticateUsersUseCase } from '@/domain/carrier/application/use-cases/authenticate-users.js'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [RegisterAccountController, AuthenticateController],
  providers: [RegisterDeliveryManUseCase, AuthenticateUsersUseCase],
})
export class HttpModule {}
