import { IsString, IsOptional } from 'class-validator';

export class CompleteTaskDto {
  @IsOptional()
  @IsString()
  answer?: string;
}
