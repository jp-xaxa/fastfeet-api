import {
  BadRequestException,
  Controller,
  HttpCode,
  Delete,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { Roles } from '@/infra/auth/roles.decorator.js'

import { DeleteOrderUseCase } from '@/domain/carrier/application/use-cases/delete-order.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

@Controller('/order/:id')
@Roles(['ADMINISTRATOR'])
export class DeleteOrderController {
  constructor(private deleteOrder: DeleteOrderUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') orderId: string) {
    const result = await this.deleteOrder.execute({
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
