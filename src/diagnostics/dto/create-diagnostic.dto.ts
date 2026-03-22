import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

const ORIGINS = ['scouting', 'direct_detection'] as const;
const PROBLEM_TYPES = ['pest', 'disease', 'nutritional_deficiency', 'abiotic_stress', 'other'] as const;
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const STRATEGIES = ['chemical', 'biological', 'cultural', 'combined'] as const;
const STATUSES = ['pending', 'in_treatment', 'resolved', 'monitoring'] as const;

export class CreateDiagnosticDto {
  @IsString()
  @IsIn([...ORIGINS])
  origin: (typeof ORIGINS)[number];

  @IsOptional()
  @IsUUID()
  scoutingRecordId?: string;

  @IsUUID()
  fieldId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  detectionDate: string;

  @IsString()
  @IsIn([...PROBLEM_TYPES])
  problemType: (typeof PROBLEM_TYPES)[number];

  @IsString()
  @IsNotEmpty()
  problemIdentified: string;

  @IsString()
  symptoms: string;

  @IsString()
  @IsIn([...SEVERITIES])
  severity: (typeof SEVERITIES)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  affectedAreaPercentage: number;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsString()
  possibleCause: string;

  @IsObject()
  contributingFactors: Record<string, unknown>;

  @IsOptional()
  @IsString()
  cropStage?: string;

  @IsString()
  @IsIn([...STRATEGIES])
  treatmentStrategy: (typeof STRATEGIES)[number];

  @IsArray()
  recommendedProducts: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  additionalInstructions?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @IsString()
  @IsIn([...STATUSES])
  status: (typeof STATUSES)[number];

  @IsOptional()
  @IsUUID()
  animalId?: string;
}
