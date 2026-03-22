import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProfessionalDto, farmId: string) {
    return this.prisma.professional.create({
      data: {
        ...dto,
        farmId,
      },
    });
  }

  async findAll(farmId: string) {
    return this.prisma.professional.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, farmId: string) {
    const row = await this.prisma.professional.findFirst({
      where: { id, farmId },
    });

    if (!row) {
      throw new NotFoundException(`Professional with id "${id}" not found`);
    }

    return row;
  }

  async update(id: string, dto: UpdateProfessionalDto, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.professional.update({
      where: { id },
      data: dto as never,
    });
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.professional.delete({
      where: { id },
    });
  }
}
