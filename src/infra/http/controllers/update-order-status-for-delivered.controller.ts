import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  ForbiddenException,
  HttpCode,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user-decorator.js'
import type { UserPayload } from '@/infra/auth/jwt.strategy.js'

import { UpdateOrderStatusForDeliveredUseCase } from '@/domain/carrier/application/use-cases/update-order-status-for-delivered.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.js'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.js'

@Controller('/order/:id/status-for-delivered')
@Roles(['DELIVERY_MAN'])
export class UpdateOrderStatusForDeliveredController {
  constructor(
    private updateOrderStatusForDelivered: UpdateOrderStatusForDeliveredUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  @UseInterceptors(FileInterceptor('photo'))
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') orderId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5mb
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    const result = await this.updateOrderStatusForDelivered.execute({
      orderId,
      deliveryManId: user.sub,
      fileName: photo.originalname,
      fileType: photo.mimetype,
      body: photo.buffer,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
