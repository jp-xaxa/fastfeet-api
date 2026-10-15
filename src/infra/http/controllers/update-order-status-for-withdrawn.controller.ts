import {
  BadRequestException,
  Controller,
  HttpCode,
  Patch,
  Body,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { z } from 'zod'

import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'

import { UpdateOrderStatusForWithdrawnUseCase } from '@/domain/carrier/application/use-cases/update-order-status-for-withdrawn.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

const updateOrderStatusForWithdrawnBodySchema = z.object({
  deliveryManId: z.uuid(),
})

type UpdateOrderStatusForWithdrawnBodySchema = z.infer<
  typeof updateOrderStatusForWithdrawnBodySchema
>

@Controller('/order/:id/status-for-withdrawn')
@Roles(['ADMINISTRATOR'])
export class UpdateOrderStatusForWithdrawnController {
  constructor(
    private updateOrderStatusForWithdrawn: UpdateOrderStatusForWithdrawnUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(updateOrderStatusForWithdrawnBodySchema))
    body: UpdateOrderStatusForWithdrawnBodySchema,
    @Param('id') orderId: string,
  ) {
    const { deliveryManId } = body

    const result = await this.updateOrderStatusForWithdrawn.execute({
      orderId,
      deliveryManId,
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
