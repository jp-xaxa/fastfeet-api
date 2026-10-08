import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service.js'
import { PaginationParams } from '@/core/repositories/pagination-params.js'
import { RecipientsRepository } from '@/domain/carrier/application/repositories/recipient-repository.js'
import { Recipient } from '@/domain/carrier/enterprise/entities/recipient.js'
import { PrismaRecipientMapper } from '../mappers/prisma-recipient-mapper.js'

@Injectable()
export class PrismaRecipientsRepository implements RecipientsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Recipient | null> {
    const recipient = await this.prisma.recipient.findFirst({
      where: {
        id,
      },
    })

    if (!recipient) {
      return null
    }

    return PrismaRecipientMapper.toDomain(recipient)
  }

  async create(recipient: Recipient): Promise<void> {
    const data = PrismaRecipientMapper.toPrisma(recipient)

    await this.prisma.recipient.create({
      data,
    })
  }

  async save(recipient: Recipient): Promise<void> {
    const data = PrismaRecipientMapper.toPrisma(recipient)

    await this.prisma.recipient.update({
      where: {
        id: recipient.id.toString(),
      },
      data,
    })
  }

  async delete(recipient: Recipient): Promise<void> {
    await this.prisma.recipient.delete({
      where: {
        id: recipient.id.toString(),
      },
    })
  }

  async findMany({ page }: PaginationParams): Promise<Recipient[]> {
    const recipients = await this.prisma.recipient.findMany({
      take: 20,
      skip: (page - 1) * 20,
    })

    return recipients.map(PrismaRecipientMapper.toDomain)
  }
}
