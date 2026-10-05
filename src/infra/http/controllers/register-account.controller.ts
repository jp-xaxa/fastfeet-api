import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { zodValidator } from 'cpf-cnpj-validator/zod'

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'
import { Roles } from '@/infra/auth/roles.decorator.js'

import { RegisterDeliveryManUseCase } from '@/domain/carrier/application/use-cases/register-delivery-man.js'
import { CpfAlreadyInUseError } from '@/domain/carrier/application/use-cases/errors/cpf-already-in-use-error.js'

const { cpf: zCpf } = zodValidator(z)

const registerAccountBodySchema = z.object({
  name: z.string(),
  // Aceita com ou sem máscara, mas sempre persiste só os dígitos.
  cpf: zCpf().transform((value) => value.replace(/\D/g, '')),
  password: z.string(),
})

type RegisterAccountBodySchema = z.infer<typeof registerAccountBodySchema>

@Controller('/accounts')
@Roles(['ADMINISTRATOR'])
export class RegisterAccountController {
  constructor(private registerDeliveryMan: RegisterDeliveryManUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerAccountBodySchema))
  async handle(@Body() body: RegisterAccountBodySchema) {
    const { name, cpf, password } = body

    const result = await this.registerDeliveryMan.execute({
      name,
      cpf,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case CpfAlreadyInUseError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
