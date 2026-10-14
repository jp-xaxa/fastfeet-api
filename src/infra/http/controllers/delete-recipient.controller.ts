import {
  BadRequestException,
  ConflictException,
  Controller,
  HttpCode,
  Delete,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Roles } from '@/infra/auth/roles.decorator.js'

import { DeleteRecipientUseCase } from '@/domain/carrier/application/use-cases/delete-recipient.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { RecipientHasOrdersError } from '@/domain/carrier/application/use-cases/errors/recipient-has-orders-error.js'

@Controller('/recipient/:id')
@Roles(['ADMINISTRATOR'])
export class DeleteRecipientController {
  constructor(private deleteRecipient: DeleteRecipientUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') recipientId: string) {
    const result = await this.deleteRecipient.execute({
      recipientId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case RecipientHasOrdersError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
