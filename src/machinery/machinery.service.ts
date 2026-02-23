import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineryDto } from './dto/create-machinery.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';

function toPrismaDateTime(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00.000Z`;
  }
  return dateStr;
}

@Injectable()
export class MachineryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMachineryDto, farmId: string) {
    const { model, acquisitionDate, ...rest } = dto;
    const created = await this.prisma.machinery.create({
      data: {
        ...rest,
        modelName: model,
        acquisitionDate: toPrismaDateTime(acquisitionDate),
        farmId,
      },
    });
    const { modelName, ...restCreated } = created;
    return {
      ...restCreated,
      model: modelName,
    };
  }

  async findAll(farmId: string) {
    const machinery = await this.prisma.machinery.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
    return machinery.map(({ modelName, ...rest }) => ({
      ...rest,
      model: modelName,
    }));
  }

  async findOne(id: string, farmId: string) {
    const machinery = await this.prisma.machinery.findFirst({
      where: { id, farmId },
    });
    if (!machinery) {
      throw new NotFoundException(`Machinery with id "${id}" not found`);
    }
    const { modelName, ...rest } = machinery;
    return {
      ...rest,
      model: modelName,
    };
  }

  async update(id: string, dto: UpdateMachineryDto, farmId: string) {
    await this.findOne(id, farmId);

    const { model, acquisitionDate, ...rest } = dto;
    const updated = await this.prisma.machinery.update({
      where: { id },
      data: {
        ...rest,
        ...(model !== undefined && { modelName: model }),
        ...(acquisitionDate !== undefined && {
          acquisitionDate: toPrismaDateTime(acquisitionDate),
        }),
      },
    });
    const { modelName, ...restUpdated } = updated;
    return {
      ...restUpdated,
      model: modelName,
    };
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.machinery.delete({ where: { id } });
  }
}
