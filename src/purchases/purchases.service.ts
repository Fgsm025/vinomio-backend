import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPurchaseDto: CreatePurchaseDto, farmId: string) {
    return this.prisma.purchase.create({
      data: {
        ...createPurchaseDto,
        farmId,
        total: createPurchaseDto.total,
        date: new Date(createPurchaseDto.date),
      },
    });
  }

  async findAll(farmId: string) {
    return this.prisma.purchase.findMany({
      where: { farmId },
      include: {
        supplier: true,
        stock: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, farmId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        id,
        farmId,
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

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto, farmId: string) {
    await this.findOne(id, farmId);

    return this.prisma.purchase.update({
      where: { id },
      data: {
        ...updatePurchaseDto,
        date: updatePurchaseDto.date ? new Date(updatePurchaseDto.date) : undefined,
      },
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.purchase.delete({ where: { id } });
  }
}
