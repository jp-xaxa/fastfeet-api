import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Roles } from '@/infra/auth/roles.decorator.js'
import { OrderDetailsPresenter } from '../presenters/order-details-presenter.js'

import { GetOrderByIdUseCase } from '@/domain/carrier/application/use-cases/get-order-by-id.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

@Controller('/order/:id')
@Roles(['ADMINISTRATOR'])
export class GetOrderByIdController {
  constructor(private getOrderById: GetOrderByIdUseCase) {}

  @Get()
  async handle(@Param('id') orderId: string) {
    const result = await this.getOrderById.execute({
      orderId,
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

    const order = result.value.order

    return { order: OrderDetailsPresenter.toHTTP(order) }
  }
}
