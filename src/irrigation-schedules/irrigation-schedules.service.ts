import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIrrigationScheduleDto } from './dto/create-irrigation-schedule.dto';
import { UpdateIrrigationScheduleDto } from './dto/update-irrigation-schedule.dto';

@Injectable()
export class IrrigationSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIrrigationScheduleDto) {
    return this.prisma.irrigationSchedule.create({ data: dto });
  }

  async findAll() {
    return this.prisma.irrigationSchedule.findMany({
      orderBy: { createdAt: 'desc' },
      include: { productionUnit: true, sector: true },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.irrigationSchedule.findUnique({
      where: { id },
      include: { productionUnit: true, sector: true },
    });
    if (!schedule) {
      throw new NotFoundException(`IrrigationSchedule with id "${id}" not found`);
    }
    return schedule;
  }

  async update(id: string, dto: UpdateIrrigationScheduleDto) {
    await this.findOne(id);
    return this.prisma.irrigationSchedule.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.irrigationSchedule.delete({ where: { id } });
  }
}
