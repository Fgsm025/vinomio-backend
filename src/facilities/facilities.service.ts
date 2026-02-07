import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFacilityDto) {
    return this.prisma.facility.create({ data: dto });
  }

  async findAll() {
    return this.prisma.facility.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) {
      throw new NotFoundException(`Facility with id "${id}" not found`);
    }
    return facility;
  }

  async update(id: string, dto: UpdateFacilityDto) {
    await this.findOne(id);
    return this.prisma.facility.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.facility.delete({ where: { id } });
  }
}
