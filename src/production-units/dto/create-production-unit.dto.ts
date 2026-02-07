import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateProductionUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  exploitationId?: string;

  @IsString()
  @IsNotEmpty()
  productionType: string;

  @IsOptional()
  @IsString()
  cropCategory?: string;

  @IsOptional()
  @IsString()
  specificVariety?: string;

  @IsOptional()
  @IsNumber()
  yearEstablished?: number;

  @IsOptional()
  @IsNumber()
  totalArea?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  associatedSectors?: string[];

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
  color?: string;
}
