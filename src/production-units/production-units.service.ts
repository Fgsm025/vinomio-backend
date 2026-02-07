import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionUnitDto } from './dto/create-production-unit.dto';
import { UpdateProductionUnitDto } from './dto/update-production-unit.dto';

@Injectable()
export class ProductionUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductionUnitDto) {
    return this.prisma.productionUnit.create({ data: dto });
  }

  async findAll() {
    return this.prisma.productionUnit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        exploitation: true,
        sectors: true,
      },
    });
  }

  async findByExploitation(exploitationId: string) {
    return this.prisma.productionUnit.findMany({
      where: { exploitationId },
      orderBy: { createdAt: 'desc' },
      include: { sectors: true },
    });
  }

  async findOne(id: string) {
    const productionUnit = await this.prisma.productionUnit.findUnique({
      where: { id },
      include: {
        exploitation: true,
        sectors: true,
      },
    });
    if (!productionUnit) {
      throw new NotFoundException(
        `Production unit with id "${id}" not found`,
      );
    }
    return productionUnit;
  }

  async update(id: string, dto: UpdateProductionUnitDto) {
    await this.findOne(id);
    return this.prisma.productionUnit.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.productionUnit.delete({ where: { id } });
  }
}
