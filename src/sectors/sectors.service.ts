import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectorDto) {
    return this.prisma.sector.create({ data: dto });
  }

  async findAll() {
    return this.prisma.sector.findMany({
      orderBy: { createdAt: 'desc' },
      include: { productionUnit: true },
    });
  }

  async findByProductionUnit(productionUnitId: string) {
    return this.prisma.sector.findMany({
      where: { productionUnitId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: { productionUnit: true },
    });
    if (!sector) {
      throw new NotFoundException(`Sector with id "${id}" not found`);
    }
    return sector;
  }

  async update(id: string, dto: UpdateSectorDto) {
    await this.findOne(id);
    return this.prisma.sector.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sector.delete({ where: { id } });
  }
}
