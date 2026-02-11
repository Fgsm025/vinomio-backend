import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString, IsInt } from 'class-validator';

export class CreateGrazingLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  polygonId?: string;

  @IsOptional()
  @IsString()
  livestockGroupId?: string;

  @IsOptional()
  @IsInt()
  animalCount?: number;

  @IsNumber()
  surface: number;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsInt()
  daysInLocation?: number;

  @IsOptional()
  @IsNumber()
  animalDaysPerAcre?: number;

  @IsString()
  @IsNotEmpty()
  plotId: string;

  @IsOptional()
  @IsString()
  color?: string;
}
