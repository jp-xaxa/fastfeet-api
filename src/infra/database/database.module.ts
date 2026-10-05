import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service.js'
import { PrismaDeliveryMansRepository } from './prisma/repositories/prisma-delivery-man-repository.js'

import { DeliveryMansRepository } from '@/domain/carrier/application/repositories/delivery-man-repository.js'

@Module({
  imports: [],
  providers: [
    PrismaService,
    {
      provide: DeliveryMansRepository,
      useClass: PrismaDeliveryMansRepository,
    },
  ],
  exports: [PrismaService, DeliveryMansRepository],
})
export class DatabaseModule {}
