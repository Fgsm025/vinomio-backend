import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplyDto {
  @IsString()
  @MaxLength(500)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  category?: string;

  /** FUEL, FERTILIZER, SUPPLIES, etc. — en JSON usá `supplyType`, no `type` (evita conflictos con reflexión / whitelist). */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplyType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbonFactor?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsBoolean()
  useSupplierProduct?: boolean;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  supplierProductId?: string;

  @IsOptional()
  @IsString()
  stockOrigin?: string;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  purchaseCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceRegular?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceDiscounted?: number;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;
}
