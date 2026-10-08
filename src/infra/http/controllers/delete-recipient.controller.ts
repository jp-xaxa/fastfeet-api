import {
  BadRequestException,
  Controller,
  HttpCode,
  Delete,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Roles } from '@/infra/auth/roles.decorator.js'

import { DeleteRecipientUseCase } from '@/domain/carrier/application/use-cases/delete-recipient.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

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
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
