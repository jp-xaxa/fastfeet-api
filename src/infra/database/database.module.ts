import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service.js'
import { PrismaDeliveryMansRepository } from './prisma/repositories/prisma-delivery-man-repository.js'
import { PrismaAdministratorsRepository } from './prisma/repositories/prisma-administrator-repository.js'
import { PrismaRecipientsRepository } from './prisma/repositories/prisma-recipient-repository.js'
import { PrismaOrdersRepository } from './prisma/repositories/prisma-order-repository.js'
import { PrismaPhotosRepository } from './prisma/repositories/prisma-photo-repository.js'

import { DeliveryMansRepository } from '@/domain/carrier/application/repositories/delivery-man-repository.js'
import { AdministratorsRepository } from '@/domain/carrier/application/repositories/administrator-repository.js'
import { RecipientsRepository } from '@/domain/carrier/application/repositories/recipient-repository.js'
import { OrdersRepository } from '@/domain/carrier/application/repositories/orders-repository.js'
import { PhotosRepository } from '@/domain/carrier/application/repositories/photos-repository.js'

@Module({
  imports: [],
  providers: [
    PrismaService,
    {
      provide: DeliveryMansRepository,
      useClass: PrismaDeliveryMansRepository,
    },
    {
      provide: AdministratorsRepository,
      useClass: PrismaAdministratorsRepository,
    },
    {
      provide: RecipientsRepository,
      useClass: PrismaRecipientsRepository,
    },
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
    {
      provide: PhotosRepository,
      useClass: PrismaPhotosRepository,
    },
  ],
  exports: [
    PrismaService,
    DeliveryMansRepository,
    AdministratorsRepository,
    RecipientsRepository,
    OrdersRepository,
    PhotosRepository,
  ],
})
export class DatabaseModule {}
