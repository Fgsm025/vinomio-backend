import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';

export class CreateLivestockGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  animalIds?: string[];

  @IsOptional()
  @IsString()
  fieldId?: string;
}
