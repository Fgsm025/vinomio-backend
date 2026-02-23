import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateWaterConsumptionDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsBoolean()
  isPotable: boolean;

  @IsDateString()
  analysisDate: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
