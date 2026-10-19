import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { z } from 'zod'

import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'

import { UpdateOrderStatusForReturnedUseCase } from '@/domain/carrier/application/use-cases/update-order-status-for-returned.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

const updateOrderStatusForReturnedBodySchema = z.object({
  reason: z.string().trim().min(1),
})

type UpdateOrderStatusForReturnedBodySchema = z.infer<
  typeof updateOrderStatusForReturnedBodySchema
>

@Controller('/order/:id/status-for-returned')
@Roles(['ADMINISTRATOR'])
export class UpdateOrderStatusForReturnedController {
  constructor(
    private updateOrderStatusForReturned: UpdateOrderStatusForReturnedUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(updateOrderStatusForReturnedBodySchema))
    body: UpdateOrderStatusForReturnedBodySchema,
    @Param('id') orderId: string,
  ) {
    const { reason } = body

    const result = await this.updateOrderStatusForReturned.execute({
      orderId,
      reason,
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
