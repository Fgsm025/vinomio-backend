import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupplierDto, farmId: string) {
    return this.prisma.supplier.create({
      data: {
        ...dto,
        farmId,
      },
    });
  }

  async findAll(farmId: string) {
    return this.prisma.supplier.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, farmId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, farmId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id "${id}" not found`);
    }

    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.supplier.update({
      where: { id },
      data: dto as never,
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}

