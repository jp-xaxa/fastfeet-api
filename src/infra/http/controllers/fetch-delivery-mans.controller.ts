import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'

import { FetchDeliveryMansUseCase } from '@/domain/carrier/application/use-cases/fetch-delivery-mans.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import { DeliveryManPresenter } from '../presenters/delivery-man-presenter.js'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/delivery-man')
@Roles(['ADMINISTRATOR'])
export class FetchDeliveryMansController {
  constructor(private fetchDeliveryMans: FetchDeliveryMansUseCase) {}

  @Get()
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchDeliveryMans.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const deliveryMans = result.value.deliveryMans

    return { deliveryMans: deliveryMans.map(DeliveryManPresenter.toHTTP) }
  }
}
