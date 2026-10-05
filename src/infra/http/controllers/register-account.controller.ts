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
import { RegisterDeliveryManUseCase } from '@/domain/carrier/application/use-cases/register-delivery-man.js'
import { DeliveryManAlreadyExistsError } from '@/domain/carrier/application/use-cases/errors/delivery-man-already-exists-error.js'
import { Public } from '@/infra/auth/public.js'

const { cpf: zCpf } = zodValidator(z)

const registerAccountBodySchema = z.object({
  name: z.string(),
  cpf: zCpf(),
  password: z.string(),
})

type RegisterAccountBodySchema = z.infer<typeof registerAccountBodySchema>

@Controller('/accounts')
@Public()
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
        case DeliveryManAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
