import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCropCycleDto {
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsOptional()
  @IsString()
  productionUnitId?: string;

  @IsString()
  @IsNotEmpty()
  sectorId: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsDateString()
  @IsNotEmpty()
  plantingDate: string;

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
  currentStatus: string;

  @IsOptional()
  @IsString()
  phenologyTemplateId?: string;

  @IsOptional()
  manualAdjustments?: any;

  @IsOptional()
  @IsString()
  notes?: string;
}
