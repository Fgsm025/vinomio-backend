import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaterConsumptionDto } from './dto/create-water-consumption.dto';
import { UpdateWaterConsumptionDto } from './dto/update-water-consumption.dto';

@Injectable()
export class WaterConsumptionService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFarmIdBySlug(slug: string): Promise<string> {
    const farm = await this.prisma.farm.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!farm) {
      throw new NotFoundException(`Farm with slug "${slug}" not found`);
    }
    return farm.id;
  }

  async findByFarmSlug(farmSlug: string) {
    const farmId = await this.getFarmIdBySlug(farmSlug);
    return this.prisma.waterConsumption.findMany({
      where: { farmId },
      orderBy: { analysisDate: 'desc' },
    });
  }

  async create(farmSlug: string, dto: CreateWaterConsumptionDto) {
    const farmId = await this.getFarmIdBySlug(farmSlug);
    return this.prisma.waterConsumption.create({
      data: {
        farmId,
        source: dto.source,
        isPotable: dto.isPotable,
        analysisDate: new Date(dto.analysisDate),
        fileUrl: dto.fileUrl ?? undefined,
      },
    });
  }

  async findOne(farmSlug: string, id: string) {
    const farmId = await this.getFarmIdBySlug(farmSlug);
    const item = await this.prisma.waterConsumption.findFirst({
      where: { id, farmId },
    });
    if (!item) {
      throw new NotFoundException(`Water consumption with id "${id}" not found`);
    }
    return item;
  }

  async update(farmSlug: string, id: string, dto: UpdateWaterConsumptionDto) {
    await this.findOne(farmSlug, id);
    const data: { source?: string; isPotable?: boolean; analysisDate?: Date; fileUrl?: string } = {};
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.isPotable !== undefined) data.isPotable = dto.isPotable;
    if (dto.analysisDate !== undefined) data.analysisDate = new Date(dto.analysisDate);
    if (dto.fileUrl !== undefined) data.fileUrl = dto.fileUrl;
    return this.prisma.waterConsumption.update({
      where: { id },
      data,
    });
  }

  async remove(farmSlug: string, id: string) {
    await this.findOne(farmSlug, id);
    return this.prisma.waterConsumption.delete({ where: { id } });
  }
}
