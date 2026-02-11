import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectorDto) {
    return this.prisma.plot.create({
      data: {
        name: dto.name,
        sigpacCode: dto.sigpacCode,
        geometry: dto.geometry as Prisma.InputJsonValue | undefined,
        surface: dto.surface,
        hasCadastralReference: dto.hasCadastralReference,
        isCommunalPasture: dto.isCommunalPasture,
        isPasturesCommonInCommon: dto.isPasturesCommonInCommon,
        tenureRegime: dto.tenureRegime,
        fieldId: dto.fieldId,
        color: dto.color,
        facilityBuildingIds: dto.facilityBuildingIds,
      },
    });
  }

  async findAll() {
    return this.prisma.plot.findMany({
      orderBy: { createdAt: 'desc' },
      include: { field: true },
    });
  }

  async findByField(fieldId: string) {
    return this.prisma.plot.findMany({
      where: { fieldId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const plot = await this.prisma.plot.findUnique({
      where: { id },
      include: { field: true },
    });
    if (!plot) {
      throw new NotFoundException(`Plot with id "${id}" not found`);
    }
    return plot;
  }

  async update(id: string, dto: UpdateSectorDto) {
    await this.findOne(id);
    const updateData: Prisma.PlotUpdateInput = {};
    
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.sigpacCode !== undefined) updateData.sigpacCode = dto.sigpacCode;
    if (dto.geometry !== undefined) updateData.geometry = dto.geometry as Prisma.InputJsonValue;
    if (dto.surface !== undefined) updateData.surface = dto.surface;
    if (dto.hasCadastralReference !== undefined) updateData.hasCadastralReference = dto.hasCadastralReference;
    if (dto.isCommunalPasture !== undefined) updateData.isCommunalPasture = dto.isCommunalPasture;
    if (dto.isPasturesCommonInCommon !== undefined) updateData.isPasturesCommonInCommon = dto.isPasturesCommonInCommon;
    if (dto.tenureRegime !== undefined) updateData.tenureRegime = dto.tenureRegime;
    if (dto.fieldId !== undefined) {
      updateData.field = dto.fieldId 
        ? { connect: { id: dto.fieldId } }
        : { disconnect: true };
    }
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.facilityBuildingIds !== undefined) updateData.facilityBuildingIds = dto.facilityBuildingIds;
    
    return this.prisma.plot.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.plot.delete({ where: { id } });
  }
}
