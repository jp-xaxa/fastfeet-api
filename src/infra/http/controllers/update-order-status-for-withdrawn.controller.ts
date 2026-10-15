import {
  BadRequestException,
  Controller,
  HttpCode,
  Patch,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Roles } from '@/infra/auth/roles.decorator.js'

import { UpdateOrderStatusForWithdrawnUseCase } from '@/domain/carrier/application/use-cases/update-order-status-for-withdrawn.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

@Controller('/order/:id/status-for-withdrawn')
@Roles(['ADMINISTRATOR'])
export class UpdateOrderStatusForWithdrawnController {
  constructor(
    private updateOrderStatusForWithdrawn: UpdateOrderStatusForWithdrawnUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  async handle(@Param('id') orderId: string) {
    const result = await this.updateOrderStatusForWithdrawn.execute({
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
