import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrazingLocationDto } from './dto/create-grazing-location.dto';
import { UpdateGrazingLocationDto } from './dto/update-grazing-location.dto';

@Injectable()
export class GrazingLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGrazingLocationDto) {
    return this.prisma.grazingLocation.create({ data: dto });
  }

  async findAll() {
    return this.prisma.grazingLocation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { plot: true, livestockGroup: true },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.grazingLocation.findUnique({
      where: { id },
      include: { plot: true, livestockGroup: true },
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
