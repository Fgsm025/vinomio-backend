import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateLotDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  sigpacCode?: string;

  @IsOptional()
  @IsObject()
  geometry?: Record<string, unknown>;

  @IsNumber()
  @IsNotEmpty()
  surface: number;

  @IsOptional()
  @IsBoolean()
  hasCadastralReference?: boolean;

  @IsOptional()
  @IsBoolean()
  isCommunalPasture?: boolean;

  @IsOptional()
  @IsBoolean()
  isPasturesCommonInCommon?: boolean;

  @IsOptional()
  @IsString()
  tenureRegime?: string;

  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsOptional()
  @IsString()
  soilType?: string;

  @IsOptional()
  @IsString()
  irrigationSystem?: string;
}
