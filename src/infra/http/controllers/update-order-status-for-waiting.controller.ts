import {
  BadRequestException,
  Controller,
  HttpCode,
  Patch,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Roles } from '@/infra/auth/roles.decorator.js'

import { UpdateOrderStatusForWaitingUseCase } from '@/domain/carrier/application/use-cases/update-order-status-for-waiting.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

@Controller('/order/:id/status-for-waiting')
@Roles(['ADMINISTRATOR'])
export class UpdateOrderStatusForWaitingController {
  constructor(
    private updateOrderStatusForWaitingOrder: UpdateOrderStatusForWaitingUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  async handle(@Param('id') orderId: string) {
    const result = await this.updateOrderStatusForWaitingOrder.execute({
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
  }
}
