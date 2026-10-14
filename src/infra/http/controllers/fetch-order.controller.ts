import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'

import { FetchOrdersUseCase } from '@/domain/carrier/application/use-cases/fetch-order.js'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import { OrderPresenter } from '../presenters/order-presenter.js'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/order')
@Roles(['ADMINISTRATOR'])
export class FetchOrdersController {
  constructor(private fetchOrders: FetchOrdersUseCase) {}

  @Get()
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchOrders.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const orders = result.value.orders

    return { orders: orders.map(OrderPresenter.toHTTP) }
  }
}
