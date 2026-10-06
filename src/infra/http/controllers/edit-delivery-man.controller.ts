import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Put,
  Param,
} from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'
import { Roles } from '@/infra/auth/roles.decorator.js'

import { EditDeliveryManUseCase } from '@/domain/carrier/application/use-cases/edit-delivery-man.js'

const editBodySchema = z.object({
  name: z.string(),
  password: z.string(),
  newPassword: z.string(),
})

type EditBodySchema = z.infer<typeof editBodySchema>

@Controller('/delivery-man/:id')
@Roles(['ADMINISTRATOR'])
export class EditDeliveryManController {
  constructor(private editDeliveryMan: EditDeliveryManUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(editBodySchema)) body: EditBodySchema,
    @Param('id') deliveryManId: string,
  ) {
    const { name, password, newPassword } = body

    const result = await this.editDeliveryMan.execute({
      deliveryManId,
      name,
      password,
      newPassword,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
