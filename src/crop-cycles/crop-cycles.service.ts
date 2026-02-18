import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropCycleDto } from './dto/create-crop-cycle.dto';
import { UpdateCropCycleDto } from './dto/update-crop-cycle.dto';

function totalPhenologyDays(crop: {
  plantingDays?: number | null;
  growingDays?: number | null;
  maturationDays?: number | null;
  veraisonDays?: number | null;
  harvestDays?: number | null;
}): number | null {
  const planting = crop.plantingDays ?? 0;
  const growing = crop.growingDays ?? 0;
  const maturation = crop.maturationDays ?? crop.veraisonDays ?? 0;
  const harvest = crop.harvestDays ?? 0;
  if (planting + growing + maturation + harvest === 0) return null;
  return planting + growing + maturation + harvest;
}

function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

function enrichCycle(cycle: {
  plantingDate: Date;
  estimatedHarvestDate?: Date | null;
  status: string;
  [key: string]: unknown;
}) {
  const now = new Date();
  const estimated =
    cycle.estimatedHarvestDate instanceof Date
      ? cycle.estimatedHarvestDate
      : cycle.estimatedHarvestDate
        ? new Date(cycle.estimatedHarvestDate as string)
        : null;
  const planting =
    cycle.plantingDate instanceof Date
      ? cycle.plantingDate
      : new Date(cycle.plantingDate as string);
  let daysToHarvest: number | null = null;
  let progressPercentage: number | null = null;
  let isDelayed = false;
  if (estimated) {
    daysToHarvest = Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const total = Math.ceil((estimated.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));
    if (total > 0) {
      const elapsed = Math.ceil((now.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));
      progressPercentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
      isDelayed = daysToHarvest < 0 && cycle.status === 'active';
    }
  }
  return {
    ...cycle,
    daysToHarvest,
    progressPercentage,
    isDelayed,
  };
}

@Injectable()
export class CropCyclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCropCycleDto) {
    const crop = await this.prisma.crop.findUnique({ where: { id: dto.cropId } });
    if (!crop) {
      throw new NotFoundException(`Crop with id "${dto.cropId}" not found`);
    }
    if (crop.cropSystem === 'monoculture') {
      const existingActive = await this.prisma.cropCycle.findFirst({
        where: { plotId: dto.plotId, status: 'active' },
      });
      if (existingActive) {
        throw new ConflictException(
          'An active cycle already exists in this plot for monoculture',
        );
      }
    }
    const plantingDate = new Date(dto.plantingDate);
    let plantDensity = dto.plantDensity;
    if (
      dto.plantedArea != null &&
      dto.plantCount != null &&
      dto.plantedArea > 0 &&
      (plantDensity == null || plantDensity === 0)
    ) {
      plantDensity = dto.plantCount / dto.plantedArea;
    }
    const totalDays = totalPhenologyDays(crop);
    let estimatedHarvestDate: Date | undefined;
    if (totalDays != null && totalDays > 0) {
      estimatedHarvestDate = addDays(plantingDate, totalDays);
    }
    const payload = {
      ...dto,
      season: dto.season ?? '',
      status: dto.status ?? 'active',
      plantingDate,
      ...(plantDensity != null && { plantDensity }),
      ...(estimatedHarvestDate && { estimatedHarvestDate }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      ...(dto.estimatedHarvestDate && {
        estimatedHarvestDate: new Date(dto.estimatedHarvestDate),
      }),
      ...(dto.actualHarvestStartDate && {
        actualHarvestStartDate: new Date(dto.actualHarvestStartDate),
      }),
      ...(dto.actualHarvestEndDate && {
        actualHarvestEndDate: new Date(dto.actualHarvestEndDate),
      }),
    };
    const cycle = await this.prisma.cropCycle.create({
      data: payload as never,
      include: { crop: true, plot: { include: { field: true } } },
    });
    return enrichCycle(cycle);
  }

  async findAll(filters?: { plotId?: string; season?: string }) {
    const where: { plotId?: string; season?: string } = {};
    if (filters?.plotId) where.plotId = filters.plotId;
    if (filters?.season != null && filters.season !== '') where.season = filters.season;
    const list = await this.prisma.cropCycle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { crop: true, plot: { include: { field: true } } },
    });
    return list.map(enrichCycle);
  }

  async findByPlot(plotId: string) {
    const list = await this.prisma.cropCycle.findMany({
      where: { plotId },
      orderBy: { createdAt: 'desc' },
      include: { crop: true, plot: { include: { field: true } } },
    });
    return list.map(enrichCycle);
  }

  async findOne(id: string) {
    const cropCycle = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: { crop: true, plot: { include: { field: true } } },
    });
    if (!cropCycle) {
      throw new NotFoundException(`CropCycle with id "${id}" not found`);
    }
    return enrichCycle(cropCycle);
  }

  async update(id: string, dto: UpdateCropCycleDto) {
    const existing = await this.prisma.cropCycle.findUnique({
      where: { id },
      include: { crop: true },
    });
    if (!existing) {
      throw new NotFoundException(`CropCycle with id "${id}" not found`);
    }
    const data: Record<string, unknown> = { ...dto };
    if (dto.plantingDate) data.plantingDate = new Date(dto.plantingDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.estimatedHarvestDate) data.estimatedHarvestDate = new Date(dto.estimatedHarvestDate);
    if (dto.actualHarvestStartDate)
      data.actualHarvestStartDate = new Date(dto.actualHarvestStartDate);
    if (dto.actualHarvestEndDate)
      data.actualHarvestEndDate = new Date(dto.actualHarvestEndDate);
    if (
      (dto.plantedArea != null || dto.plantCount != null) &&
      dto.plantDensity == null &&
      (dto.plantedArea ?? existing.plantedArea) != null &&
      (dto.plantCount ?? existing.plantCount) != null &&
      (dto.plantedArea ?? existing.plantedArea)! > 0
    ) {
      data.plantDensity =
        (dto.plantCount ?? existing.plantCount)! /
        (dto.plantedArea ?? existing.plantedArea)!;
    }
    if (
      (dto.status === 'completed' || dto.status === 'archived') &&
      !(dto.actualHarvestEndDate ?? existing.actualHarvestEndDate) &&
      !(dto.endDate ?? existing.endDate)
    ) {
      throw new BadRequestException(
        'Closing the cycle requires actualHarvestEndDate or endDate',
      );
    }
    const cycle = await this.prisma.cropCycle.update({
      where: { id },
      data: data as never,
      include: { crop: true, plot: { include: { field: true } } },
    });
    return enrichCycle(cycle);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cropCycle.delete({ where: { id } });
  }
}
