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
  farmId: string;

  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsOptional()
  @IsString()
  plotId?: string;

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
