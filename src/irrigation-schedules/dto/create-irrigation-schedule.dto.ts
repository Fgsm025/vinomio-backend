import { IsString, IsOptional, IsNumber, IsNotEmpty, IsBoolean, IsDateString, IsArray, IsInt } from 'class-validator';

export class CreateIrrigationScheduleDto {
  @IsString()
  @IsNotEmpty()
  scheduleName: string;

  @IsOptional()
  @IsString()
  fieldId?: string;

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
  duration?: number;

  @IsOptional()
  @IsNumber()
  waterVolume?: number;

  @IsOptional()
  @IsDateString()
  nextScheduledDate?: string;

  @IsOptional()
  @IsDateString()
  lastExecutedDate?: string;

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
  @IsString()
  notes?: string;
}
