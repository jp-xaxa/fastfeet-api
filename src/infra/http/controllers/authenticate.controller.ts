import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { zodValidator } from 'cpf-cnpj-validator/zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe.js'
import { AuthenticateUsersUseCase } from '@/domain/carrier/application/use-cases/authenticate-users.js'
import { WrongCredentialsError } from '@/domain/carrier/application/use-cases/errors/wrong-credentials-error.js'
import { Public } from '@/infra/auth/public.js'

const { cpf: zCpf } = zodValidator(z)

const authenticateBodySchema = z.object({
  cpf: zCpf(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticateUsers: AuthenticateUsersUseCase) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { cpf, password } = body

    const result = await this.authenticateUsers.execute({
      cpf,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value

    return {
      access_token: accessToken,
    }
  }
}
