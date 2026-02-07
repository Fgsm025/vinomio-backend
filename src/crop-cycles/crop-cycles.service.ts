import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropCycleDto } from './dto/create-crop-cycle.dto';
import { UpdateCropCycleDto } from './dto/update-crop-cycle.dto';

@Injectable()
export class CropCyclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCropCycleDto) {
    return this.prisma.cropCycle.create({
      data: dto,
      include: { crop: true, sector: true, productionUnit: true },
    });
  }

  async findAll() {
    return this.prisma.cropCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: { crop: true, sector: true, productionUnit: true },
    });
  }

  async findBySector(sectorId: string) {
    return this.prisma.cropCycle.findMany({
      where: { sectorId },
      orderBy: { createdAt: 'desc' },
      include: { crop: true, sector: true, productionUnit: true },
    });
  }

  async findOne(id: string) {
    const cropCycle = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: { crop: true, sector: true, productionUnit: true },
    });
    if (!cropCycle) {
      throw new NotFoundException(`CropCycle with id "${id}" not found`);
    }
    return cropCycle;
  }

  async update(id: string, dto: UpdateCropCycleDto) {
    await this.findOne(id);
    return this.prisma.cropCycle.update({
      where: { id },
      data: dto,
      include: { crop: true, sector: true, productionUnit: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cropCycle.delete({ where: { id } });
  }
}
