import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPurchaseDto: CreatePurchaseDto, exploitationId: string) {
    return this.prisma.purchase.create({
      data: {
        ...createPurchaseDto,
        exploitationId,
        total: createPurchaseDto.total,
        date: new Date(createPurchaseDto.date),
      },
    });
  }

  async findAll(exploitationId: string) {
    return this.prisma.purchase.findMany({
      where: { exploitationId },
      include: {
        supplier: true,
        stock: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, exploitationId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        id,
        exploitationId,
      },
      include: {
        supplier: true,
        stock: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with id "${id}" not found`);
    }

    return purchase;
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto, exploitationId: string) {
    await this.findOne(id, exploitationId);

    return this.prisma.purchase.update({
      where: { id },
      data: {
        ...updatePurchaseDto,
        date: updatePurchaseDto.date ? new Date(updatePurchaseDto.date) : undefined,
      },
    });
  }

  async remove(id: string, exploitationId: string) {
    await this.findOne(id, exploitationId);
    return this.prisma.purchase.delete({ where: { id } });
  }
}
