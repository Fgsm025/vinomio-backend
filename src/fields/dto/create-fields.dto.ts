import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateFieldDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  farmId?: string;

  @IsString()
  @IsNotEmpty()
  productionType: string;

  @IsOptional()
  @IsNumber()
  yearEstablished?: number;

  @IsOptional()
  @IsString()
  primaryLocation?: string;

  @IsString()
  @IsNotEmpty()
  managementType: string;

  @IsOptional()
  @IsString()
  certification?: string;

  @IsString()
  @IsNotEmpty()
  tenureRegime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  hasIrrigationSystem?: boolean;

  @IsOptional()
  @IsString()
  responsibleManager?: string;

  @IsOptional()
  @IsObject()
  expectedAnnualProduction?: { quantity: number; unit: string };

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sigpacCode?: string;

  @IsOptional()
  @IsString()
  cadastralReference?: string;

  @IsOptional()
  @IsObject()
  geometry?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  surface?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilityBuildingIds?: string[];
}
