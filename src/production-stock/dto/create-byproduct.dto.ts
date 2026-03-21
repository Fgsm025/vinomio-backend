import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateByproductDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsDateString()
  productionDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plotIds?: string[];

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
