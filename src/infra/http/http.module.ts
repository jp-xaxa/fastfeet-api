import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module.js'
import { CryptographyModule } from '../cryptography/cryptography.module.js'

import { AuthenticateController } from './controllers/authenticate.controller.js'
import { RegisterAccountController } from './controllers/register-account.controller.js'
import { DeleteDeliveryManController } from './controllers/delete-delivery-man.controller.js'
import { FetchDeliveryMansController } from './controllers/fetch-delivery-mans.controller.js'
import { EditDeliveryManController } from './controllers/edit-delivery-man.controller.js'

import { AuthenticateUsersUseCase } from '@/domain/carrier/application/use-cases/authenticate-users.js'
import { RegisterDeliveryManUseCase } from '@/domain/carrier/application/use-cases/register-delivery-man.js'
import { DeleteDeliveryManUseCase } from '@/domain/carrier/application/use-cases/delete-delivery-man.js'
import { FetchDeliveryMansUseCase } from '@/domain/carrier/application/use-cases/fetch-delivery-mans.js'
import { EditDeliveryManUseCase } from '@/domain/carrier/application/use-cases/edit-delivery-man.js'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    RegisterAccountController,
    DeleteDeliveryManController,
    FetchDeliveryMansController,
    EditDeliveryManController,
  ],
  providers: [
    AuthenticateUsersUseCase,
    RegisterDeliveryManUseCase,
    DeleteDeliveryManUseCase,
    FetchDeliveryMansUseCase,
    EditDeliveryManUseCase,
  ],
})
export class HttpModule {}
