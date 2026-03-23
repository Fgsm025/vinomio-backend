import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateIrrigationScheduleDto {
  @IsString()
  @IsNotEmpty()
  scheduleName: string;

  @IsUUID()
  fieldId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plotIds?: string[];

  @IsOptional()
  @IsString()
  fieldName?: string;

  @IsOptional()
  @IsString()
  lotName?: string;

  @IsOptional()
  @IsString()
  cropType?: string;

  @IsString()
  @IsNotEmpty()
  irrigationMethod: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsNumber()
  waterVolume?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  flowRate?: number;

  @IsOptional()
  @IsDateString()
  nextScheduledDate?: string;

  @IsOptional()
  @IsDateString()
  lastExecutedDate?: string;

  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  daysOfWeek?: string[];

  @IsOptional()
  @IsNumber()
  soilMoistureThreshold?: number;

  @IsOptional()
  @IsBoolean()
  weatherDependent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxCyclesPerDay?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cooldownMinutes?: number;

  @IsOptional()
  @IsBoolean()
  skipIfRain?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
