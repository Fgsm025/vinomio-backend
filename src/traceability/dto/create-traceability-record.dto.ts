import { IsString, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTraceabilityRecordDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  lotNumber: string;

  @IsString()
  @IsNotEmpty()
  exploitationId: string;

  @IsOptional()
  @IsString()
  productionUnitId?: string;

  @IsOptional()
  @IsString()
  sectorId?: string;

  @IsDateString()
  @IsNotEmpty()
  applicationDate: string;

  @IsString()
  @IsNotEmpty()
  appliedBy: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
