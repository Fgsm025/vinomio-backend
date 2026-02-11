import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateIrrigationScheduleDto) {
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

  async findAll() {
    const list = await this.prisma.irrigationSchedule.findMany({
      orderBy: { createdAt: 'desc' },
      include: { field: true, plotsOnSchedule: true },
    });
    return list.map(toScheduleWithPlotIds);
  }

  async findOne(id: string) {
    const schedule = await this.prisma.irrigationSchedule.findUnique({
      where: { id },
      include: { field: true, plotsOnSchedule: true },
    });
    if (!schedule) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
    return toScheduleWithPlotIds(schedule);
  }

  async update(id: string, dto: UpdateIrrigationScheduleDto) {
    const existing = await this.prisma.irrigationSchedule.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
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

  async remove(id: string) {
    const existing = await this.prisma.irrigationSchedule.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
    return this.prisma.irrigationSchedule.delete({ where: { id } });
  }
}
