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

import { EditRecipientUseCase } from '@/domain/carrier/application/use-cases/edit-recipient.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'

const editBodySchema = z.object({
  name: z.string(),
  street: z.string(),
  neighborhood: z.string(),
  number: z.number().int().positive().optional(),
  complement: z.string().optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  uf: z.string().length(2),
})

type EditBodySchema = z.infer<typeof editBodySchema>

@Controller('/recipient/:id')
@Roles(['ADMINISTRATOR'])
export class EditRecipientController {
  constructor(private editRecipient: EditRecipientUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(editBodySchema)) body: EditBodySchema,
    @Param('id') recipientId: string,
  ) {
    const { name, street, neighborhood, number, complement, cep, uf } = body

    const result = await this.editRecipient.execute({
      recipientId,
      name,
      street,
      neighborhood,
      number,
      complement,
      cep,
      uf,
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
