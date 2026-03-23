import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIrrigationScheduleDto } from './dto/create-irrigation-schedule.dto';
import { UpdateIrrigationScheduleDto } from './dto/update-irrigation-schedule.dto';

function toScheduleWithPlotIds(schedule: {
  plotsOnSchedule: { plotId: string }[];
  [k: string]: unknown;
}) {
  const { plotsOnSchedule, ...rest } = schedule;
  return {
    ...rest,
    plotIds: plotsOnSchedule?.map((p) => p.plotId) ?? [],
  };
}

@Injectable()
export class IrrigationSchedulesService {
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

  async create(dto: CreateIrrigationScheduleDto, farmId: string) {
    await this.assertFieldInFarm(dto.fieldId, farmId);
    await this.assertPlotsInField(dto.plotIds ?? [], dto.fieldId, farmId);
    const { plotIds, ...rest } = dto;
    const created = await this.prisma.irrigationSchedule.create({
      data: {
        ...rest,
        plotsOnSchedule: {
          create: (plotIds ?? []).map((plotId) => ({ plotId })),
        },
      },
      include: { plotsOnSchedule: true },
    });
    return toScheduleWithPlotIds(created);
  }

  async findAll(farmId: string) {
    const list = await this.prisma.irrigationSchedule.findMany({
      where: {
        field: { farmId },
      },
      orderBy: { createdAt: 'desc' },
      include: { field: true, plotsOnSchedule: true },
    });
    return list.map(toScheduleWithPlotIds);
  }

  async findOne(id: string, farmId: string) {
    const schedule = await this.prisma.irrigationSchedule.findUnique({
      where: { id },
      include: { field: true, plotsOnSchedule: true },
    });
    if (!schedule) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
    if (!schedule.fieldId) {
      throw new BadRequestException('Irrigation schedule missing fieldId');
    }
    await this.assertFieldInFarm(schedule.fieldId, farmId);
    return toScheduleWithPlotIds(schedule);
  }

  async update(id: string, dto: UpdateIrrigationScheduleDto, farmId: string) {
    const existingRaw = await this.prisma.irrigationSchedule.findFirst({
      where: { id, field: { farmId } },
      include: { plotsOnSchedule: true },
    });
    if (!existingRaw) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
    const existing = toScheduleWithPlotIds(existingRaw);
    const fieldId = dto.fieldId ?? existingRaw.fieldId;
    if (!fieldId) {
      throw new BadRequestException('fieldId is required');
    }
    await this.assertFieldInFarm(fieldId, farmId);
    await this.assertPlotsInField(dto.plotIds ?? existing.plotIds ?? [], fieldId, farmId);

    const { plotIds, ...rest } = dto;
    const updateData = { ...rest } as Parameters<
      typeof this.prisma.irrigationSchedule.update
    >[0]['data'];
    if (plotIds !== undefined) {
      (updateData as Record<string, unknown>).plotsOnSchedule = {
        deleteMany: {},
        create: plotIds.map((plotId) => ({ plotId })),
      };
    }
    const updated = await this.prisma.irrigationSchedule.update({
      where: { id },
      data: updateData,
      include: { plotsOnSchedule: true },
    });
    return toScheduleWithPlotIds(updated);
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.irrigationSchedule.delete({ where: { id } });
  }

  async removeByRange(
    filters: { start?: string; end?: string; fieldId?: string; plotId?: string },
    farmId: string,
  ) {
    if (!filters.start || !filters.end) {
      throw new BadRequestException('Query params "start" and "end" are required');
    }

    const start = new Date(filters.start);
    const end = new Date(filters.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid start or end date');
    }

    const deleted = await this.prisma.irrigationSchedule.deleteMany({
      where: {
        field: { farmId },
        ...(filters.fieldId ? { fieldId: filters.fieldId } : {}),
        ...(filters.plotId
          ? {
              plotsOnSchedule: {
                some: { plotId: filters.plotId },
              },
            }
          : {}),
        startAt: {
          gte: start,
          lte: end,
        },
      },
    });

    return { deletedCount: deleted.count };
  }
}
