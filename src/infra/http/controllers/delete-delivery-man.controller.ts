import {
  BadRequestException,
  Controller,
  HttpCode,
  Delete,
  Param,
} from '@nestjs/common'
import { Roles } from '@/infra/auth/roles.decorator.js'

import { DeleteDeliveryManUseCase } from '@/domain/carrier/application/use-cases/delete-delivery-man.js'

@Controller('/delivery-man/:id')
@Roles(['ADMINISTRATOR'])
export class DeleteDeliveryManController {
  constructor(private deleteDeliveryMan: DeleteDeliveryManUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') deliveryManId: string) {
    const result = await this.deleteDeliveryMan.execute({
      deliveryManId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
