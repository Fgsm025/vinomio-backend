import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrazingLocationDto } from './dto/create-grazing-location.dto';
import { UpdateGrazingLocationDto } from './dto/update-grazing-location.dto';

@Injectable()
export class GrazingLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGrazingLocationDto) {
    const data = {
      name: dto.name,
      type: dto.type,
      surface: dto.surface,
      ...(dto.polygonId !== undefined && { polygonId: dto.polygonId }),
      ...(dto.livestockGroupId !== undefined && { livestockGroupId: dto.livestockGroupId }),
      ...(dto.animalCount !== undefined && { animalCount: dto.animalCount }),
      ...(dto.entryDate !== undefined && { entryDate: new Date(dto.entryDate) }),
      ...(dto.daysInLocation !== undefined && { daysInLocation: dto.daysInLocation }),
      ...(dto.animalDaysPerAcre !== undefined && { animalDaysPerAcre: dto.animalDaysPerAcre }),
      ...(dto.fieldId !== undefined && { fieldId: dto.fieldId }),
      ...(dto.plotId !== undefined && { plotId: dto.plotId }),
      ...(dto.color !== undefined && { color: dto.color }),
    };
    return this.prisma.grazingLocation.create({
      data: data as Prisma.GrazingLocationUncheckedCreateInput,
    });
  }

  async findAll() {
    return this.prisma.grazingLocation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { field: true, plot: true, livestockGroup: true } as Prisma.GrazingLocationInclude,
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.grazingLocation.findUnique({
      where: { id },
      include: { field: true, plot: true, livestockGroup: true } as Prisma.GrazingLocationInclude,
    });
    if (!location) {
      throw new NotFoundException(`GrazingLocation with id "${id}" not found`);
    }
    return location;
  }

  async update(id: string, dto: UpdateGrazingLocationDto) {
    await this.findOne(id);
    return this.prisma.grazingLocation.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.grazingLocation.delete({ where: { id } });
  }
}
