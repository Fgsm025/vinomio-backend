import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsArray,
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
  exploitationSystem?: string;

  @IsOptional()
  @IsString()
  agriculturalActivity?: string;

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
  plantDensity?: number;

  @IsOptional()
  @IsBoolean()
  isPermanentCrop?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityRegimes?: string[];

  @IsOptional()
  image?: any;
}
