import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module.js'
import { CryptographyModule } from '../cryptography/cryptography.module.js'

import { AuthenticateController } from './controllers/authenticate.controller.js'
import { RegisterAccountController } from './controllers/register-account.controller.js'
import { DeleteDeliveryManController } from './controllers/delete-delivery-man.controller.js'
import { FetchDeliveryMansController } from './controllers/fetch-delivery-mans.controller.js'
import { EditDeliveryManController } from './controllers/edit-delivery-man.controller.js'
import { CreateRecipientController } from './controllers/create-recipient.controller.js'
import { DeleteRecipientController } from './controllers/delete-recipient.controller.js'
import { EditRecipientController } from './controllers/edit-recipient.controller.js'
import { FetchRecipientsController } from './controllers/fetch-recipient.controller.js'

import { AuthenticateUsersUseCase } from '@/domain/carrier/application/use-cases/authenticate-users.js'
import { RegisterDeliveryManUseCase } from '@/domain/carrier/application/use-cases/register-delivery-man.js'
import { DeleteDeliveryManUseCase } from '@/domain/carrier/application/use-cases/delete-delivery-man.js'
import { FetchDeliveryMansUseCase } from '@/domain/carrier/application/use-cases/fetch-delivery-mans.js'
import { EditDeliveryManUseCase } from '@/domain/carrier/application/use-cases/edit-delivery-man.js'
import { CreateRecipientUseCase } from '@/domain/carrier/application/use-cases/create-recipient.js'
import { DeleteRecipientUseCase } from '@/domain/carrier/application/use-cases/delete-recipient.js'
import { EditRecipientUseCase } from '@/domain/carrier/application/use-cases/edit-recipient.js'
import { FetchRecipientsUseCase } from '@/domain/carrier/application/use-cases/fetch-recipient.js'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    RegisterAccountController,
    DeleteDeliveryManController,
    FetchDeliveryMansController,
    EditDeliveryManController,
    CreateRecipientController,
    DeleteRecipientController,
    EditRecipientController,
    FetchRecipientsController,
  ],
  providers: [
    AuthenticateUsersUseCase,
    RegisterDeliveryManUseCase,
    DeleteDeliveryManUseCase,
    FetchDeliveryMansUseCase,
    EditDeliveryManUseCase,
    CreateRecipientUseCase,
    DeleteRecipientUseCase,
    EditRecipientUseCase,
    FetchRecipientsUseCase,
  ],
})
export class HttpModule {}
