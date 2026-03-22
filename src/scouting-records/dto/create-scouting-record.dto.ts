import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

const HEALTH = ['excellent', 'stable', 'stressed', 'critical'] as const;
const SEVERITY = ['low', 'moderate', 'high', 'severe'] as const;

export class CreateScoutingRecordDto {
  @IsUUID()
  fieldId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsString()
  @IsNotEmpty()
  responsible: string;

  @IsString()
  observations: string;

  @IsString()
  @IsIn([...HEALTH])
  healthStatus: (typeof HEALTH)[number];

  @IsBoolean()
  pestDetected: boolean;

  @IsBoolean()
  diseaseDetected: boolean;

  @IsString()
  @IsIn([...SEVERITY])
  severityLevel: (typeof SEVERITY)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  affectedAreaPercentage: number;

  @IsOptional()
  @IsUUID()
  plotId?: string;
}
