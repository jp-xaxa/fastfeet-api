import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'

import { FetchRecipientsUseCase } from '@/domain/carrier/application/use-cases/fetch-recipient.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import { RecipientPresenter } from '../presenters/recipient-presenter.js'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/recipient')
@Roles(['ADMINISTRATOR'])
export class FetchRecipientsController {
  constructor(private fetchRecipients: FetchRecipientsUseCase) {}

  @Get()
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchRecipients.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const recipients = result.value.recipients

    return { recipients: recipients.map(RecipientPresenter.toHTTP) }
  }
}
