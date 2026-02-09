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

  async findAll(userId: string) {
    return this.prisma.productionUnit.findMany({
      where: {
        exploitation: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
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

  async findOne(id: string, userId: string) {
    const productionUnit = await this.prisma.productionUnit.findFirst({
      where: {
        id,
        exploitation: {
          users: {
            some: {
              userId,
            },
          },
        },
      },
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

  async update(id: string, dto: UpdateProductionUnitDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.productionUnit.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.productionUnit.delete({ where: { id } });
  }
}
