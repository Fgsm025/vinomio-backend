import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsIn,
} from 'class-validator';

const PRODUCTION_CYCLE_STAGES = [
  'PREPARATION',
  'ESTABLISHMENT',
  'VEGETATIVE',
  'MATURATION',
  'HARVEST',
  'POST_HARVEST',
] as const;

const CYCLE_STATUSES = ['active', 'completed', 'failed', 'archived'] as const;

export class CreateCropCycleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsNotEmpty()
  cropId: string;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsString()
  @IsNotEmpty()
  plotId: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  @IsIn(CYCLE_STATUSES)
  status?: string;

  @IsDateString()
  @IsNotEmpty()
  plantingDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  endReason?: string;

  @IsOptional()
  @IsNumber()
  plantedArea?: number;

  @IsOptional()
  @IsNumber()
  plantCount?: number;

  @IsOptional()
  @IsNumber()
  plantDensity?: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(PRODUCTION_CYCLE_STAGES)
  currentStatus: string;

  @IsOptional()
  @IsString()
  phenologyTemplateId?: string;

  @IsOptional()
  manualAdjustments?: Record<string, unknown>;

  @IsOptional()
  stages?: any;

  @IsOptional()
  @IsString()
  workflowOption?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  seedBatch?: string;

  @IsOptional()
  @IsString()
  nurseryOrigin?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  estimatedHarvestDate?: string;

  @IsOptional()
  @IsString()
  actualHarvestStartDate?: string;

  @IsOptional()
  @IsString()
  actualHarvestEndDate?: string;

  @IsOptional()
  @IsNumber()
  actualYield?: number;

  @IsOptional()
  @IsString()
  @IsIn(['kg', 'ton', 'units'])
  yieldUnit?: string;

  @IsOptional()
  @IsString()
  previousCropId?: string;

  @IsOptional()
  @IsString()
  nextPlannedCropId?: string;

  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsOptional()
  @IsString()
  productionUnitId?: string;

  @IsOptional()
  @IsString()
  sectorId?: string;
}
