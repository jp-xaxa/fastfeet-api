import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  Patch,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user-decorator.js'
import type { UserPayload } from '@/infra/auth/jwt.strategy.js'

import { UpdateOrderStatusForDeliveredUseCase } from '@/domain/carrier/application/use-cases/update-order-status-for-delivered.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.js'

@Controller('/order/:id/status-for-delivered')
@Roles(['DELIVERY_MAN'])
export class UpdateOrderStatusForDeliveredController {
  constructor(
    private updateOrderStatusForDelivered: UpdateOrderStatusForDeliveredUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  async handle(@CurrentUser() user: UserPayload, @Param('id') orderId: string) {
    const result = await this.updateOrderStatusForDelivered.execute({
      orderId,
      deliveryManId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
