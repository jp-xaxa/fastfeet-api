import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'

import {
  Uploader,
  UploadParams,
} from '@/domain/carrier/application/storage/uploader.js'
import { EnvService } from '../env/env.service.js'

@Injectable()
export class DiskStorage implements Uploader {
  constructor(private env: EnvService) {}

  async upload({ fileName, body }: UploadParams): Promise<{ url: string }> {
    const directory = resolve(this.env.get('STORAGE_PATH'))

    // basename + replace impedem path traversal (ex.: "../../etc/passwd")
    const safeFileName = basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_')
    const url = `${randomUUID()}-${safeFileName}`

    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, url), body)

    return { url }
  }

  async delete(url: string): Promise<void> {
    const directory = resolve(this.env.get('STORAGE_PATH'))

    await rm(join(directory, basename(url)), { force: true })
  }
}
