import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SyncPipelineDealDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  stage: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  priority: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  progress: number;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsString()
  createDate: string;

  @IsString()
  closeDate: string;

  @IsString()
  lastUpdate: string;

  @IsObject()
  owner: Record<string, unknown>;

  @IsObject()
  client: Record<string, unknown>;

  @IsObject()
  company: Record<string, unknown>;

  @IsArray()
  collaborators: Record<string, unknown>[];
}

export class SyncPipelineDealsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncPipelineDealDto)
  deals: SyncPipelineDealDto[];
}
