import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSprayRecordDto } from './dto/create-spray-record.dto';
import { UpdateSprayRecordDto } from './dto/update-spray-record.dto';

@Injectable()
export class SprayRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertFieldInFarm(fieldId: string, farmId: string) {
    const field = await this.prisma.field.findFirst({
      where: { id: fieldId, farmId },
    });
    if (!field) {
      throw new BadRequestException('Field not found for this farm');
    }
  }

  private async assertPlotsInField(plotIds: string[], fieldId: string, farmId: string) {
    if (!plotIds.length) return;
    const plots = await this.prisma.plot.findMany({
      where: {
        id: { in: plotIds },
        fieldId,
        field: { farmId },
      },
      select: { id: true },
    });
    if (plots.length !== plotIds.length) {
      throw new BadRequestException('One or more plots do not belong to selected field/farm');
    }
  }

  async create(dto: CreateSprayRecordDto, farmId: string) {
    const plotIds = dto.plotIds ?? [];
    await this.assertFieldInFarm(dto.fieldId, farmId);
    await this.assertPlotsInField(plotIds, dto.fieldId, farmId);

    const created = await this.prisma.sprayRecord.create({
      data: {
        farmId,
        fieldId: dto.fieldId,
        plotId: plotIds[0] ?? null,
        plotIds,
        date: new Date(`${dto.date}T12:00:00.000Z`),
        applicationType: dto.applicationType,
        applicationMethod: dto.applicationMethod,
        targetPestDisease: dto.targetPestDisease ?? null,
        weatherConditions: dto.weatherConditions ?? null,
        temperature: dto.temperature ?? null,
        windSpeed: dto.windSpeed ?? null,
        responsible: dto.responsible,
        areaApplied: dto.areaApplied,
        areaUnit: dto.areaUnit,
        waterVolume: dto.waterVolume ?? null,
        waterVolumeUnit: dto.waterVolumeUnit ?? null,
        phi: dto.phi ?? null,
        harvestDate: dto.harvestDate ? new Date(`${dto.harvestDate}T12:00:00.000Z`) : null,
        notes: dto.notes ?? null,
        photos: (dto.photos ?? []) as unknown as object,
        products: {
          create: (dto.products ?? []).map((p) => ({
            productId: p.productId ?? null,
            productName: p.productName,
            dosage: p.dosage,
            dosageUnit: p.dosageUnit,
          })),
        },
      },
      include: {
        products: true,
      },
    });

    return created;
  }

  async findAll(farmId: string) {
    return this.prisma.sprayRecord.findMany({
      where: { farmId },
      orderBy: { date: 'desc' },
      include: {
        products: true,
      },
    });
  }

  async findOne(id: string, farmId: string) {
    const record = await this.prisma.sprayRecord.findFirst({
      where: { id, farmId },
      include: {
        products: true,
      },
    });
    if (!record) {
      throw new NotFoundException(`SprayRecord with id "${id}" not found`);
    }
    return record;
  }

  async update(id: string, dto: UpdateSprayRecordDto, farmId: string) {
    const existing = await this.findOne(id, farmId);
    const fieldId = dto.fieldId ?? existing.fieldId;
    const plotIds = dto.plotIds ?? existing.plotIds;
    await this.assertFieldInFarm(fieldId, farmId);
    await this.assertPlotsInField(plotIds, fieldId, farmId);

    const data: Parameters<typeof this.prisma.sprayRecord.update>[0]['data'] = {
      ...(dto.fieldId !== undefined && { fieldId: dto.fieldId }),
      ...(dto.plotIds !== undefined && { plotIds: dto.plotIds, plotId: dto.plotIds[0] ?? null }),
      ...(dto.date !== undefined && { date: new Date(`${dto.date}T12:00:00.000Z`) }),
      ...(dto.applicationType !== undefined && { applicationType: dto.applicationType }),
      ...(dto.applicationMethod !== undefined && { applicationMethod: dto.applicationMethod }),
      ...(dto.targetPestDisease !== undefined && { targetPestDisease: dto.targetPestDisease }),
      ...(dto.weatherConditions !== undefined && { weatherConditions: dto.weatherConditions }),
      ...(dto.temperature !== undefined && { temperature: dto.temperature }),
      ...(dto.windSpeed !== undefined && { windSpeed: dto.windSpeed }),
      ...(dto.responsible !== undefined && { responsible: dto.responsible }),
      ...(dto.areaApplied !== undefined && { areaApplied: dto.areaApplied }),
      ...(dto.areaUnit !== undefined && { areaUnit: dto.areaUnit }),
      ...(dto.waterVolume !== undefined && { waterVolume: dto.waterVolume }),
      ...(dto.waterVolumeUnit !== undefined && { waterVolumeUnit: dto.waterVolumeUnit }),
      ...(dto.phi !== undefined && { phi: dto.phi }),
      ...(dto.harvestDate !== undefined && {
        harvestDate: dto.harvestDate ? new Date(`${dto.harvestDate}T12:00:00.000Z`) : null,
      }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.photos !== undefined && { photos: (dto.photos ?? []) as unknown as object }),
      ...(dto.products !== undefined && {
        products: {
          deleteMany: {},
          create: dto.products.map((p) => ({
            productId: p.productId ?? null,
            productName: p.productName,
            dosage: p.dosage,
            dosageUnit: p.dosageUnit,
          })),
        },
      }),
    };

    return this.prisma.sprayRecord.update({
      where: { id },
      data,
      include: {
        products: true,
      },
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.sprayRecord.delete({ where: { id } });
  }
}
