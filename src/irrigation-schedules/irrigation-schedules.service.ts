import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIrrigationScheduleDto } from './dto/create-irrigation-schedule.dto';
import { UpdateIrrigationScheduleDto } from './dto/update-irrigation-schedule.dto';

function toScheduleWithSectorIds(schedule: {
  sectorsOnSchedule: { sectorId: string }[];
  [k: string]: unknown;
}) {
  const { sectorsOnSchedule, ...rest } = schedule;
  return {
    ...rest,
    sectorIds: sectorsOnSchedule?.map((s) => s.sectorId) ?? [],
  };
}

@Injectable()
export class IrrigationSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIrrigationScheduleDto) {
    const { sectorIds, ...rest } = dto;
    const created = await this.prisma.irrigationSchedule.create({
      data: {
        ...rest,
        sectorsOnSchedule: {
          create: (sectorIds ?? []).map((sectorId) => ({ sectorId })),
        },
      },
      include: { sectorsOnSchedule: true },
    });
    return toScheduleWithSectorIds(created);
  }

  async findAll() {
    const list = await this.prisma.irrigationSchedule.findMany({
      orderBy: { createdAt: 'desc' },
      include: { productionUnit: true, sectorsOnSchedule: true },
    });
    return list.map(toScheduleWithSectorIds);
  }

  async findOne(id: string) {
    const schedule = await this.prisma.irrigationSchedule.findUnique({
      where: { id },
      include: { productionUnit: true, sectorsOnSchedule: true },
    });
    if (!schedule) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
    return toScheduleWithSectorIds(schedule);
  }

  async update(id: string, dto: UpdateIrrigationScheduleDto) {
    const existing = await this.prisma.irrigationSchedule.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
    const { sectorIds, ...rest } = dto;
    const updateData = { ...rest } as Parameters<
      typeof this.prisma.irrigationSchedule.update
    >[0]['data'];
    if (sectorIds !== undefined) {
      (updateData as Record<string, unknown>).sectorsOnSchedule = {
        deleteMany: {},
        create: sectorIds.map((sectorId) => ({ sectorId })),
      };
    }
    const updated = await this.prisma.irrigationSchedule.update({
      where: { id },
      data: updateData,
      include: { sectorsOnSchedule: true },
    });
    return toScheduleWithSectorIds(updated);
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
