import {
  BadRequestException,
  Controller,
  HttpCode,
  Put,
  Body,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { z } from 'zod'

import { Roles } from '@/infra/auth/roles.decorator.js'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'

import { EditOrderUseCase } from '@/domain/carrier/application/use-cases/edit-order.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

const editOrderBodySchema = z.object({
  recipientId: z.uuid(),
})

type EditOrderBodySchema = z.infer<typeof editOrderBodySchema>

@Controller('/order/:id')
@Roles(['ADMINISTRATOR'])
export class EditOrderController {
  constructor(private editOrder: EditOrderUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(editOrderBodySchema)) body: EditOrderBodySchema,
    @Param('id') orderId: string,
  ) {
    const { recipientId } = body

    const result = await this.editOrder.execute({
      orderId,
      recipientId,
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
