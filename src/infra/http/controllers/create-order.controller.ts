import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'
import { Roles } from '@/infra/auth/roles.decorator.js'

import { CreateOrderUseCase } from '@/domain/carrier/application/use-cases/create-order.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

const createOrderBodySchema = z.object({
  recipientId: z.uuid(),
})

type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

@Controller('/order')
@Roles(['ADMINISTRATOR'])
export class CreateOrderController {
  constructor(private createOrder: CreateOrderUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createOrderBodySchema))
  async handle(@Body() body: CreateOrderBodySchema) {
    const { recipientId } = body

    const result = await this.createOrder.execute({
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

    const order = result.value.order

    return { id: order.id.toString() }
  }
}
