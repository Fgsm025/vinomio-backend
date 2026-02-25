import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsString()
  farmId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
