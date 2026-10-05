import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { UserPayload } from '@/infra/auth/jwt.strategy.js'
import { Roles } from './roles.decorator.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles || roles.length === 0) {
      return true // sem @Roles → só exige estar logado (o JwtAuthGuard já cuidou disso)
    }

    const user = context.switchToHttp().getRequest().user as
      UserPayload | undefined

    if (!user) {
      return false // ex.: rota @Public com @Roles; combinação inválida, então nega
    }

    return roles.includes(user.role)
  }
}
