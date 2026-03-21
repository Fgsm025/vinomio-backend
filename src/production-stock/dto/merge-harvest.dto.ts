import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class MergeHarvestDto {
  @IsUUID()
  cropId!: string;

  @IsUUID()
  cropCycleId!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @IsDateString()
  harvestDate!: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
