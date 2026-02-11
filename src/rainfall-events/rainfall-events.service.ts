import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRainfallEventDto } from './dto/create-rainfall-event.dto';
import { UpdateRainfallEventDto } from './dto/update-rainfall-event.dto';

@Injectable()
export class RainfallEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRainfallEventDto) {
    return this.prisma.rainfallEvent.create({ data: dto });
  }

  async findAll() {
    return this.prisma.rainfallEvent.findMany({
      orderBy: { createdAt: 'desc' },
      include: { field: true, plot: true },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.rainfallEvent.findUnique({
      where: { id },
      include: { field: true, plot: true },
    });
    if (!event) {
      throw new NotFoundException(`RainfallEvent with id "${id}" not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateRainfallEventDto) {
    await this.findOne(id);
    return this.prisma.rainfallEvent.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rainfallEvent.delete({ where: { id } });
  }
}
