import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateSectorDto {
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
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilityBuildingIds?: string[];
}
