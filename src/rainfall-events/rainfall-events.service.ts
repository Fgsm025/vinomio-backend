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

  private async assertPlotInField(plotId: string | undefined, fieldId: string, farmId: string) {
    if (!plotId) return;
    const plot = await this.prisma.plot.findFirst({
      where: { id: plotId, fieldId, field: { farmId } },
    });
    if (!plot) throw new BadRequestException('Plot not found for this field');
  }

  async create(dto: CreateRainfallEventDto, farmId: string) {
    await this.assertFieldInFarm(dto.fieldId, farmId);
    await this.assertPlotInField(dto.plotId, dto.fieldId, farmId);
    return this.prisma.rainfallEvent.create({ data: dto });
  }

  async findAll(farmId: string) {
    return this.prisma.rainfallEvent.findMany({
      where: {
        field: { farmId },
      },
      orderBy: { createdAt: 'desc' },
      include: { field: true, plot: true },
    });
  }

  async findOne(id: string, farmId: string) {
    const event = await this.prisma.rainfallEvent.findUnique({
      where: { id },
      include: { field: true, plot: true },
    });
    if (!event) {
      throw new NotFoundException(`RainfallEvent with id "${id}" not found`);
    }
    if (event.field.farmId !== farmId) {
      throw new NotFoundException(`RainfallEvent with id "${id}" not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateRainfallEventDto, farmId: string) {
    const existing = await this.findOne(id, farmId);
    const fieldId = dto.fieldId ?? existing.fieldId;
    await this.assertFieldInFarm(fieldId, farmId);
    await this.assertPlotInField(dto.plotId ?? existing.plotId ?? undefined, fieldId, farmId);
    return this.prisma.rainfallEvent.update({ where: { id }, data: dto });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.rainfallEvent.delete({ where: { id } });
  }
}
