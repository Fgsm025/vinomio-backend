import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLivestockGroupDto } from './dto/create-livestock-group.dto';
import { UpdateLivestockGroupDto } from './dto/update-livestock-group.dto';

@Injectable()
export class LivestockGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLivestockGroupDto) {
    return this.prisma.livestockGroup.create({ data: dto });
  }

  async findAll() {
    return this.prisma.livestockGroup.findMany({
      orderBy: { createdAt: 'desc' },
      include: { productionUnit: true },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.livestockGroup.findUnique({
      where: { id },
      include: { productionUnit: true },
    });
    if (!group) {
      throw new NotFoundException(`LivestockGroup with id "${id}" not found`);
    }
    return group;
  }

  async update(id: string, dto: UpdateLivestockGroupDto) {
    await this.findOne(id);
    return this.prisma.livestockGroup.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.livestockGroup.delete({ where: { id } });
  }
}
