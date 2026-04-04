import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRainfallEventDto } from './dto/create-rainfall-event.dto';
import { UpdateRainfallEventDto } from './dto/update-rainfall-event.dto';

@Injectable()
export class RainfallEventsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertFieldInFarm(fieldId: string, farmId: string) {
    const field = await this.prisma.field.findFirst({ where: { id: fieldId, farmId } });
    if (!field) throw new BadRequestException('Field not found for this farm');
  }

  private async assertPlotInFarm(
    plotId: string | undefined,
    fieldId: string | undefined,
    farmId: string,
  ) {
    if (!plotId) return;
    const plot = await this.prisma.plot.findFirst({
      where: { id: plotId, field: { farmId } },
    });
    if (!plot) throw new BadRequestException('Plot not found for this farm');
    if (fieldId && plot.fieldId !== fieldId) {
      throw new BadRequestException('Plot does not match field');
    }
  }

  private async assertCropCycleInFarm(cropCycleId: string | undefined, farmId: string) {
    if (!cropCycleId) return;
    const cycle = await this.prisma.cropCycle.findFirst({
      where: { id: cropCycleId, plot: { field: { farmId } } },
    });
    if (!cycle) throw new BadRequestException('Crop cycle not found for this farm');
  }

  async create(dto: CreateRainfallEventDto, farmId: string) {
    if (dto.fieldId) {
      await this.assertFieldInFarm(dto.fieldId, farmId);
    }
    await this.assertPlotInFarm(dto.plotId, dto.fieldId, farmId);
    await this.assertCropCycleInFarm(dto.cropCycleId, farmId);
    return this.prisma.rainfallEvent.create({
      data: {
        farmId,
        fieldId: dto.fieldId,
        plotId: dto.plotId,
        cropCycleId: dto.cropCycleId ?? undefined,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        amountMm: dto.amountMm,
        intensity: dto.intensity,
        source: dto.source,
        notes: dto.notes,
      },
    });
  }

  async findAll(farmId: string) {
    return this.prisma.rainfallEvent.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
      include: { farm: true, field: true, plot: true, cropCycle: true },
    });
  }

  async findOne(id: string, farmId: string) {
    const event = await this.prisma.rainfallEvent.findUnique({
      where: { id },
      include: { farm: true, field: true, plot: true, cropCycle: true },
    });
    if (!event) {
      throw new NotFoundException(`RainfallEvent with id "${id}" not found`);
    }
    if (event.farmId !== farmId) {
      throw new NotFoundException(`RainfallEvent with id "${id}" not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateRainfallEventDto, farmId: string) {
    const existing = await this.findOne(id, farmId);
    const nextFieldId =
      dto.fieldId !== undefined ? dto.fieldId : (existing.fieldId ?? undefined);
    if (dto.fieldId) {
      await this.assertFieldInFarm(dto.fieldId, farmId);
    }
    await this.assertPlotInFarm(
      dto.plotId ?? existing.plotId ?? undefined,
      nextFieldId ?? undefined,
      farmId,
    );
    if (dto.cropCycleId) {
      await this.assertCropCycleInFarm(dto.cropCycleId, farmId);
    }
    return this.prisma.rainfallEvent.update({ where: { id }, data: dto });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.rainfallEvent.delete({ where: { id } });
  }
}
