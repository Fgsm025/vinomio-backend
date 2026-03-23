import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const APPLICATION_TYPES = ['fertilization', 'pest_control', 'disease_control', 'other'] as const;
const APPLICATION_METHODS = ['foliar', 'soil', 'fertigation', 'spot_treatment', 'broadcast'] as const;
const AREA_UNITS = ['hectares', 'acres'] as const;

export class CreateSprayRecordProductDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dosage: number;

  @IsString()
  @IsNotEmpty()
  dosageUnit: string;
}

export class CreateSprayRecordDto {
  @IsUUID()
  fieldId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  plotIds?: string[];

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsString()
  @IsIn([...APPLICATION_TYPES])
  applicationType: (typeof APPLICATION_TYPES)[number];

  @IsString()
  @IsIn([...APPLICATION_METHODS])
  applicationMethod: (typeof APPLICATION_METHODS)[number];

  @IsOptional()
  @IsString()
  targetPestDisease?: string;

  @IsOptional()
  @IsString()
  weatherConditions?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  windSpeed?: number;

  @IsString()
  @IsNotEmpty()
  responsible: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  areaApplied: number;

  @IsString()
  @IsIn([...AREA_UNITS])
  areaUnit: (typeof AREA_UNITS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  waterVolume?: number;

  @IsOptional()
  @IsString()
  waterVolumeUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  phi?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  harvestDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSprayRecordProductDto)
  products: CreateSprayRecordProductDto[];
}
