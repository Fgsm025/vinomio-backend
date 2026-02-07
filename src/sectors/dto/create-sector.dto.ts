import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateSectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  sigpacCode?: string;

  @IsOptional()
  @IsNumber()
  surface?: number;

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
  productionUnitId?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilityBuildingIds?: string[];
}
