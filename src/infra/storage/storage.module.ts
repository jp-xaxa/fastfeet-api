import { Module } from '@nestjs/common'

import { Uploader } from '@/domain/carrier/application/storage/uploader.js'

import { EnvModule } from '../env/env.module.js'
import { DiskStorage } from './disk-storage.js'

@Module({
  imports: [EnvModule],
  providers: [{ provide: Uploader, useClass: DiskStorage }],
  exports: [Uploader],
})
export class StorageModule {}
