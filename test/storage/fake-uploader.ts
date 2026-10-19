import { randomUUID } from 'node:crypto'

import {
  Uploader,
  UploadParams,
} from '@/domain/carrier/application/storage/uploader.js'

interface Upload {
  fileName: string
  url: string
}

export class FakeUploader implements Uploader {
  public uploads: Upload[] = []

  async upload({ fileName }: UploadParams): Promise<{ url: string }> {
    const url = `${randomUUID()}-${fileName}`

    this.uploads.push({
      fileName,
      url,
    })

    return { url }
  }

  async delete(url: string): Promise<void> {
    this.uploads = this.uploads.filter((upload) => upload.url !== url)
  }
}
