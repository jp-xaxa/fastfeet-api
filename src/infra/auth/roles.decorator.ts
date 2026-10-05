import { Reflector } from '@nestjs/core'
import type { UserPayload } from '@/infra/auth/jwt.strategy.js'

export const Roles = Reflector.createDecorator<UserPayload['role'][]>()
