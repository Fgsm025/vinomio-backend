import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTraceabilityRecordDto } from './dto/create-traceability-record.dto';
import { UpdateTraceabilityRecordDto } from './dto/update-traceability-record.dto';

@Injectable()
export class TraceabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTraceabilityRecordDto) {
    return this.prisma.traceabilityRecord.create({ data: dto });
  }

  async findAll() {
    return this.prisma.traceabilityRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: { farm: true, field: true, plot: true },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.traceabilityRecord.findUnique({
      where: { id },
      include: { farm: true, field: true, plot: true },
    });
    if (!record) {
      throw new NotFoundException(`TraceabilityRecord with id "${id}" not found`);
    }
    return record;
  }

  async update(id: string, dto: UpdateTraceabilityRecordDto) {
    await this.findOne(id);
    return this.prisma.traceabilityRecord.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.traceabilityRecord.delete({ where: { id } });
  }
}
