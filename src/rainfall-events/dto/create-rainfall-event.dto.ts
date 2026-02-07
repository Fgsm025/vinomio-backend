import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateRainfallEventDto {
  @IsString()
  @IsNotEmpty()
  productionUnitId: string;

  @IsOptional()
  @IsString()
  sectorId?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  amountMm?: number;

  @IsOptional()
  @IsString()
  intensity?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
