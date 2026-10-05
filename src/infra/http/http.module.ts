import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module.js'
import { CryptographyModule } from '../cryptography/cryptography.module.js'

import { AuthenticateController } from './controllers/authenticate.controller.js'
import { RegisterAccountController } from './controllers/register-account.controller.js'
import { DeleteDeliveryManController } from './controllers/delete-delivery-man.controller.js'

import { AuthenticateUsersUseCase } from '@/domain/carrier/application/use-cases/authenticate-users.js'
import { RegisterDeliveryManUseCase } from '@/domain/carrier/application/use-cases/register-delivery-man.js'
import { DeleteDeliveryManUseCase } from '@/domain/carrier/application/use-cases/delete-delivery-man.js'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    RegisterAccountController,
    DeleteDeliveryManController,
  ],
  providers: [
    AuthenticateUsersUseCase,
    RegisterDeliveryManUseCase,
    DeleteDeliveryManUseCase,
  ],
})
export class HttpModule {}
