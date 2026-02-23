import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsObject()
  completionData?: any;

  @IsOptional()
  @IsObject()
  nodeData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  priority?: string | null;
}
