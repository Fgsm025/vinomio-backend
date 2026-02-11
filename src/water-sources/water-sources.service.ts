import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaterSourceDto } from './dto/create-water-source.dto';
import { UpdateWaterSourceDto } from './dto/update-water-source.dto';

@Injectable()
export class WaterSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWaterSourceDto) {
    return this.prisma.waterSource.create({ data: dto });
  }

  async findAll() {
    return this.prisma.waterSource.findMany({
      orderBy: { createdAt: 'desc' },
      include: { field: true },
    });
  }

  async findOne(id: string) {
    const waterSource = await this.prisma.waterSource.findUnique({
      where: { id },
      include: { field: true },
    });
    if (!waterSource) {
      throw new NotFoundException(`WaterSource with id "${id}" not found`);
    }
    return waterSource;
  }

  async update(id: string, dto: UpdateWaterSourceDto) {
    await this.findOne(id);
    return this.prisma.waterSource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.waterSource.delete({ where: { id } });
  }
}
