import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service.js'
import { PrismaDeliveryMansRepository } from './prisma/repositories/prisma-delivery-man-repository.js'
import { PrismaAdministratorsRepository } from './prisma/repositories/prisma-administrator-repository.js'
import { PrismaRecipientsRepository } from './prisma/repositories/prisma-recipient-repository.js'

import { DeliveryMansRepository } from '@/domain/carrier/application/repositories/delivery-man-repository.js'
import { AdministratorsRepository } from '@/domain/carrier/application/repositories/administrator-repository.js'
import { RecipientsRepository } from '@/domain/carrier/application/repositories/recipient-repository.js'

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
  ],
  exports: [
    PrismaService,
    DeliveryMansRepository,
    AdministratorsRepository,
    RecipientsRepository,
  ],
})
export class DatabaseModule {}
