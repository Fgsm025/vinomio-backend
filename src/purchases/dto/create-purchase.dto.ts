import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  supplierId: string;

  @IsNumber()
  total: number;

  @IsDateString()
  date: string;
}
