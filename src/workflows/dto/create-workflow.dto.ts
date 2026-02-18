import { IsString, IsOptional, IsBoolean, Allow } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Allow()
  nodes: unknown;

  @Allow()
  edges: unknown;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsString()
  farmId?: string;
}
