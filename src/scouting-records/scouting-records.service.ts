import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoutingRecordDto } from './dto/create-scouting-record.dto';
import { UpdateScoutingRecordDto } from './dto/update-scouting-record.dto';

export type ScoutingRecordApi = {
  id: string;
  fieldId: string;
  plotId: string | null;
  date: string;
  responsible: string;
  observations: string;
  healthStatus: string;
  pestDetected: boolean;
  diseaseDetected: boolean;
  severityLevel: string;
  affectedAreaPercentage: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ScoutingRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private toApi(row: {
    id: string;
    fieldId: string;
    plotId: string | null;
    observationDate: Date;
    responsible: string;
    observations: string;
    healthStatus: string;
    pestDetected: boolean;
    diseaseDetected: boolean;
    severityLevel: string;
    affectedAreaPercentage: number;
    createdAt: Date;
    updatedAt: Date;
  }): ScoutingRecordApi {
    return {
      id: row.id,
      fieldId: row.fieldId,
      plotId: row.plotId,
      date: row.observationDate.toISOString().slice(0, 10),
      responsible: row.responsible,
      observations: row.observations,
      healthStatus: row.healthStatus,
      pestDetected: row.pestDetected,
      diseaseDetected: row.diseaseDetected,
      severityLevel: row.severityLevel,
      affectedAreaPercentage: row.affectedAreaPercentage,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private async assertFieldInFarm(fieldId: string, farmId: string) {
    const field = await this.prisma.field.findFirst({
      where: { id: fieldId, farmId },
    });
    if (!field) {
      throw new BadRequestException('Field not found for this farm');
    }
  }

  private async assertPlotInField(plotId: string | undefined, fieldId: string, farmId: string) {
    if (!plotId) {
      return;
    }
    const plot = await this.prisma.plot.findFirst({
      where: { id: plotId, fieldId, field: { farmId } },
    });
    if (!plot) {
      throw new BadRequestException('Plot not found for this field');
    }
  }

  async create(dto: CreateScoutingRecordDto, farmId: string): Promise<ScoutingRecordApi> {
    await this.assertFieldInFarm(dto.fieldId, farmId);
    await this.assertPlotInField(dto.plotId, dto.fieldId, farmId);

    const row = await this.prisma.scoutingRecord.create({
      data: {
        farmId,
        fieldId: dto.fieldId,
        plotId: dto.plotId ?? null,
        observationDate: new Date(`${dto.date}T12:00:00.000Z`),
        responsible: dto.responsible,
        observations: dto.observations,
        healthStatus: dto.healthStatus,
        pestDetected: dto.pestDetected,
        diseaseDetected: dto.diseaseDetected,
        severityLevel: dto.severityLevel,
        affectedAreaPercentage: dto.affectedAreaPercentage,
      },
    });

    return this.toApi(row);
  }

  async findAll(farmId: string): Promise<ScoutingRecordApi[]> {
    const rows = await this.prisma.scoutingRecord.findMany({
      where: { farmId },
      orderBy: { observationDate: 'desc' },
    });
    return rows.map((r) => this.toApi(r));
  }

  async findOne(id: string, farmId: string): Promise<ScoutingRecordApi> {
    const row = await this.prisma.scoutingRecord.findFirst({
      where: { id, farmId },
    });
    if (!row) {
      throw new NotFoundException(`Scouting record "${id}" not found`);
    }
    return this.toApi(row);
  }

  async update(id: string, dto: UpdateScoutingRecordDto, farmId: string): Promise<ScoutingRecordApi> {
    const existing = await this.prisma.scoutingRecord.findFirst({
      where: { id, farmId },
    });
    if (!existing) {
      throw new NotFoundException(`Scouting record "${id}" not found`);
    }

    const fieldId = dto.fieldId ?? existing.fieldId;
    await this.assertFieldInFarm(fieldId, farmId);
    await this.assertPlotInField(dto.plotId ?? existing.plotId ?? undefined, fieldId, farmId);

    const row = await this.prisma.scoutingRecord.update({
      where: { id },
      data: {
        ...(dto.fieldId !== undefined && { fieldId: dto.fieldId }),
        ...(dto.plotId !== undefined && { plotId: dto.plotId }),
        ...(dto.date !== undefined && {
          observationDate: new Date(`${dto.date}T12:00:00.000Z`),
        }),
        ...(dto.responsible !== undefined && { responsible: dto.responsible }),
        ...(dto.observations !== undefined && { observations: dto.observations }),
        ...(dto.healthStatus !== undefined && { healthStatus: dto.healthStatus }),
        ...(dto.pestDetected !== undefined && { pestDetected: dto.pestDetected }),
        ...(dto.diseaseDetected !== undefined && { diseaseDetected: dto.diseaseDetected }),
        ...(dto.severityLevel !== undefined && { severityLevel: dto.severityLevel }),
        ...(dto.affectedAreaPercentage !== undefined && {
          affectedAreaPercentage: dto.affectedAreaPercentage,
        }),
      },
    });

    return this.toApi(row);
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    await this.prisma.scoutingRecord.delete({ where: { id } });
    return { id };
  }
}
