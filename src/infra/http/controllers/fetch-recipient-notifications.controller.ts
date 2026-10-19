import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { z } from 'zod'

import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import { NotificationPresenter } from '../presenters/notification-presenter.js'

import { FetchRecipientNotificationsUseCase } from '@/domain/notification/application/use-cases/fetch-recipient-notifications.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/recipient/:id/notifications')
@Roles(['ADMINISTRATOR'])
export class FetchRecipientNotificationsController {
  constructor(
    private fetchRecipientNotifications: FetchRecipientNotificationsUseCase,
  ) {}

  @Get()
  async handle(
    @Param('id') recipientId: string,
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
  ) {
    const result = await this.fetchRecipientNotifications.execute({
      recipientId,
      page,
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

    const notifications = result.value.notifications

    return { notifications: notifications.map(NotificationPresenter.toHTTP) }
  }
}
