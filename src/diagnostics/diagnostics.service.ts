import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { UpdateDiagnosticDto } from './dto/update-diagnostic.dto';

export type DiagnosticApi = {
  id: string;
  origin: string;
  scoutingRecordId?: string;
  fieldId: string;
  detectionDate: string;
  problemType: string;
  problemIdentified: string;
  symptoms: string;
  severity: string;
  affectedAreaPercentage: number;
  photos: string[];
  possibleCause: string;
  contributingFactors: Record<string, unknown>;
  cropStage?: string;
  treatmentStrategy: string;
  recommendedProducts: Record<string, unknown>[];
  additionalInstructions?: string;
  estimatedCost?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class DiagnosticsService {
  constructor(private readonly prisma: PrismaService) {}

  private toApi(row: {
    id: string;
    origin: string;
    scoutingRecordId: string | null;
    fieldId: string;
    diagnosisDate: Date;
    problemType: string;
    problemIdentified: string;
    symptoms: string;
    severity: string;
    affectedAreaPercentage: number;
    photos: Prisma.JsonValue;
    possibleCause: string;
    contributingFactors: Prisma.JsonValue;
    cropStage: string | null;
    treatmentStrategy: string;
    recommendedProducts: Prisma.JsonValue;
    additionalInstructions: string | null;
    estimatedCost: number | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): DiagnosticApi {
    return {
      id: row.id,
      origin: row.origin,
      scoutingRecordId: row.scoutingRecordId ?? undefined,
      fieldId: row.fieldId,
      detectionDate: row.diagnosisDate.toISOString().slice(0, 10),
      problemType: row.problemType,
      problemIdentified: row.problemIdentified,
      symptoms: row.symptoms,
      severity: row.severity,
      affectedAreaPercentage: row.affectedAreaPercentage,
      photos: (Array.isArray(row.photos) ? row.photos : []) as string[],
      possibleCause: row.possibleCause,
      contributingFactors: (typeof row.contributingFactors === 'object' && row.contributingFactors !== null
        ? (row.contributingFactors as Record<string, unknown>)
        : {}) as Record<string, unknown>,
      cropStage: row.cropStage ?? undefined,
      treatmentStrategy: row.treatmentStrategy,
      recommendedProducts: (Array.isArray(row.recommendedProducts) ? row.recommendedProducts : []) as Record<
        string,
        unknown
      >[],
      additionalInstructions: row.additionalInstructions ?? undefined,
      estimatedCost: row.estimatedCost ?? undefined,
      status: row.status,
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

  private async assertScoutingForFarm(
    scoutingRecordId: string | undefined,
    farmId: string,
    fieldId: string,
  ) {
    if (!scoutingRecordId) {
      return;
    }
    const sr = await this.prisma.scoutingRecord.findFirst({
      where: { id: scoutingRecordId, farmId },
    });
    if (!sr) {
      throw new BadRequestException('Scouting record not found for this farm');
    }
    if (sr.fieldId !== fieldId) {
      throw new BadRequestException('Scouting record does not match the selected field');
    }
  }

  async create(dto: CreateDiagnosticDto, farmId: string): Promise<DiagnosticApi> {
    await this.assertFieldInFarm(dto.fieldId, farmId);
    await this.assertScoutingForFarm(dto.scoutingRecordId, farmId, dto.fieldId);

    const row = await this.prisma.diagnostic.create({
      data: {
        farmId,
        fieldId: dto.fieldId,
        scoutingRecordId: dto.scoutingRecordId ?? null,
        animalId: dto.animalId ?? null,
        origin: dto.origin,
        diagnosisDate: new Date(`${dto.detectionDate}T12:00:00.000Z`),
        problemType: dto.problemType,
        problemIdentified: dto.problemIdentified,
        symptoms: dto.symptoms,
        severity: dto.severity,
        affectedAreaPercentage: dto.affectedAreaPercentage,
        photos: dto.photos as unknown as Prisma.InputJsonValue,
        possibleCause: dto.possibleCause,
        contributingFactors: dto.contributingFactors as unknown as Prisma.InputJsonValue,
        cropStage: dto.cropStage ?? null,
        treatmentStrategy: dto.treatmentStrategy,
        recommendedProducts: dto.recommendedProducts as unknown as Prisma.InputJsonValue,
        additionalInstructions: dto.additionalInstructions ?? null,
        estimatedCost: dto.estimatedCost ?? null,
        status: dto.status,
      },
    });

    return this.toApi(row);
  }

  async findAll(farmId: string): Promise<DiagnosticApi[]> {
    const rows = await this.prisma.diagnostic.findMany({
      where: { farmId },
      orderBy: { diagnosisDate: 'desc' },
    });
    return rows.map((r) => this.toApi(r));
  }

  async findOne(id: string, farmId: string): Promise<DiagnosticApi> {
    const row = await this.prisma.diagnostic.findFirst({
      where: { id, farmId },
    });
    if (!row) {
      throw new NotFoundException(`Diagnostic "${id}" not found`);
    }
    return this.toApi(row);
  }

  async update(id: string, dto: UpdateDiagnosticDto, farmId: string): Promise<DiagnosticApi> {
    const existing = await this.prisma.diagnostic.findFirst({
      where: { id, farmId },
    });
    if (!existing) {
      throw new NotFoundException(`Diagnostic "${id}" not found`);
    }

    const fieldId = dto.fieldId ?? existing.fieldId;
    await this.assertFieldInFarm(fieldId, farmId);
    await this.assertScoutingForFarm(dto.scoutingRecordId ?? existing.scoutingRecordId ?? undefined, farmId, fieldId);

    const row = await this.prisma.diagnostic.update({
      where: { id },
      data: {
        ...(dto.fieldId !== undefined && { fieldId: dto.fieldId }),
        ...(dto.scoutingRecordId !== undefined && { scoutingRecordId: dto.scoutingRecordId }),
        ...(dto.animalId !== undefined && { animalId: dto.animalId }),
        ...(dto.origin !== undefined && { origin: dto.origin }),
        ...(dto.detectionDate !== undefined && {
          diagnosisDate: new Date(`${dto.detectionDate}T12:00:00.000Z`),
        }),
        ...(dto.problemType !== undefined && { problemType: dto.problemType }),
        ...(dto.problemIdentified !== undefined && { problemIdentified: dto.problemIdentified }),
        ...(dto.symptoms !== undefined && { symptoms: dto.symptoms }),
        ...(dto.severity !== undefined && { severity: dto.severity }),
        ...(dto.affectedAreaPercentage !== undefined && {
          affectedAreaPercentage: dto.affectedAreaPercentage,
        }),
        ...(dto.photos !== undefined && { photos: dto.photos as unknown as Prisma.InputJsonValue }),
        ...(dto.possibleCause !== undefined && { possibleCause: dto.possibleCause }),
        ...(dto.contributingFactors !== undefined && {
          contributingFactors: dto.contributingFactors as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.cropStage !== undefined && { cropStage: dto.cropStage }),
        ...(dto.treatmentStrategy !== undefined && { treatmentStrategy: dto.treatmentStrategy }),
        ...(dto.recommendedProducts !== undefined && {
          recommendedProducts: dto.recommendedProducts as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.additionalInstructions !== undefined && {
          additionalInstructions: dto.additionalInstructions,
        }),
        ...(dto.estimatedCost !== undefined && { estimatedCost: dto.estimatedCost }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    return this.toApi(row);
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    await this.prisma.diagnostic.delete({ where: { id } });
    return { id };
  }
}
