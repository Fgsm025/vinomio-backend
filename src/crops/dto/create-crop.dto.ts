import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateCropDto {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsOptional()
  @IsString()
  nameOrDescription?: string;

  @IsOptional()
  @IsString()
  @IsIn(['irrigation', 'rainfed'])
  exploitationSystem?: string;

  @IsOptional()
  @IsString()
  cropSystem?: string;

  @IsOptional()
  @IsString()
  ecologicalProductionCertificate?: string;

  @IsOptional()
  @IsString()
  cropDestination?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cropDestinations?: string[];

  @IsOptional()
  @IsString()
  soilCoverage?: string;

  @IsOptional()
  @IsBoolean()
  integratedProduction?: boolean;

  @IsOptional()
  @IsString()
  reproductionPlantMaterial?: string;

  @IsOptional()
  @IsString()
  typeDetail?: string;

  @IsOptional()
  @IsNumber()
  horizontalPlantingFrame?: number;

  @IsOptional()
  @IsNumber()
  verticalPlantingFrame?: number;

  @IsOptional()
  @IsNumber()
  betweenRows?: number;

  @IsOptional()
  @IsNumber()
  onRow?: number;

  @IsOptional()
  @IsNumber()
  plantDensity?: number;

  @IsOptional()
  @IsBoolean()
  isPermanentCrop?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityRegimes?: string[];

  @IsOptional()
  image?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  scientificName?: string;

  @IsOptional()
  @IsNumber()
  lifespan?: number;

  @IsOptional()
  @IsString()
  @IsIn(['single', 'multiple', 'continuous'])
  harvestType?: string;

  @IsOptional()
  @IsNumber()
  estimatedYieldPerHa?: number;

  @IsOptional()
  @IsString()
  @IsIn(['kg', 'ton', 'units'])
  yieldUnit?: string;

  @IsOptional()
  @IsNumber()
  minTemperature?: number;

  @IsOptional()
  @IsNumber()
  maxTemperature?: number;

  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high', 'very-high'])
  waterRequirements?: string;

  @IsOptional()
  @IsNumber()
  plantingDays?: number;

  @IsOptional()
  @IsNumber()
  growingDays?: number;

  @IsOptional()
  @IsNumber()
  veraisonDays?: number;

  @IsOptional()
  @IsNumber()
  maturationDays?: number;

  @IsOptional()
  @IsNumber()
  harvestDays?: number;

  @IsOptional()
  @IsNumber()
  postHarvestDays?: number;
}
