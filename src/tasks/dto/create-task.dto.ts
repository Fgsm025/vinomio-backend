import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['todo', 'in_progress', 'done', 'blocked'])
  status?: string;

  @IsOptional()
  @IsString()
  cropCycleId?: string;

  @IsOptional()
  @IsString()
  workflowId?: string;

  @IsOptional()
  @IsString()
  workflowName?: string;

  @IsOptional()
  @IsString()
  cropCycleName?: string;

  @IsOptional()
  @IsString()
  plotName?: string;

  @IsOptional()
  @IsString()
  nodeId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['task', 'condition', 'wait'])
  nodeType?: string;

  @IsOptional()
  nodeData?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditionOptions?: string[];

  @IsOptional()
  @IsString()
  conditionAnswer?: string;

  @IsOptional()
  @IsString()
  nextNodeIdOnYes?: string;

  @IsOptional()
  @IsString()
  nextNodeIdOnNo?: string;

  @IsOptional()
  @IsNumber()
  waitDays?: number;

  @IsOptional()
  @IsString()
  @IsIn(['manual', 'workflow_node'])
  sourceType?: string;

  @IsOptional()
  @IsNumber()
  stageIndex?: number;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  @IsNotEmpty()
  farmId: string;
}
