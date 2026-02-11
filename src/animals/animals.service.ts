import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

function toPrismaDateTime(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00.000Z`);
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

@Injectable()
export class AnimalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAnimalDto, farmId: string) {
    const { birthDate, dateWeaned, ...rest } = dto;
    return this.prisma.animal.create({
      data: {
        ...rest,
        birthDate: toPrismaDateTime(birthDate),
        dateWeaned: toPrismaDateTime(dateWeaned),
        farmId,
      },
    });
  }

  async findAll(farmId: string) {
    return this.prisma.animal.findMany({
      where: {
        OR: [
          { farmId },
          { field: { farmId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, farmId: string) {
    const animal = await this.prisma.animal.findFirst({
      where: {
        id,
        OR: [
          { farmId },
          { field: { farmId } },
        ],
      },
    });
    if (!animal) {
      throw new NotFoundException(`Animal with id "${id}" not found`);
    }
    return animal;
  }

  async update(id: string, dto: UpdateAnimalDto, farmId: string) {
    await this.findOne(id, farmId);
    const { birthDate, dateWeaned, ...rest } = dto;
    return this.prisma.animal.update({
      where: { id },
      data: {
        ...rest,
        ...(birthDate !== undefined && { birthDate: toPrismaDateTime(birthDate) }),
        ...(dateWeaned !== undefined && { dateWeaned: toPrismaDateTime(dateWeaned) }),
      },
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.animal.delete({ where: { id } });
  }
}
