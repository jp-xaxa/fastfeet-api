import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'
import { Roles } from '@/infra/auth/roles.decorator.js'

import { CreateRecipientUseCase } from '@/domain/carrier/application/use-cases/create-recipient.js'

const createRecipientBodySchema = z.object({
  name: z.string(),
  street: z.string(),
  neighborhood: z.string(),
  number: z.number().int().positive().optional(),
  complement: z.string().optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  uf: z.string().length(2),
})

type CreateRecipientBodySchema = z.infer<typeof createRecipientBodySchema>

@Controller('/recipient')
@Roles(['ADMINISTRATOR'])
export class CreateRecipientController {
  constructor(private createRecipient: CreateRecipientUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createRecipientBodySchema))
  async handle(@Body() body: CreateRecipientBodySchema) {
    const { name, street, neighborhood, number, complement, cep, uf } = body

    const result = await this.createRecipient.execute({
      name,
      street,
      neighborhood,
      number,
      complement,
      cep,
      uf,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
