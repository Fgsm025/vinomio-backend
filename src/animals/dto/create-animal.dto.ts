import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateAnimalDto {
  @IsString()
  @IsNotEmpty()
  nameLabel: string;

  @IsString()
  @IsNotEmpty()
  animalType: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsString()
  @IsNotEmpty()
  sex: string;

  @IsOptional()
  @IsString()
  labelsKeywords?: string;

  @IsOptional()
  @IsString()
  internalId?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsBoolean()
  neutered?: boolean;

  @IsOptional()
  @IsBoolean()
  isBreedingStock?: boolean;

  @IsOptional()
  @IsString()
  coloring?: string;

  @IsOptional()
  @IsNumber()
  retentionScore?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  dam?: string;

  @IsOptional()
  @IsString()
  sire?: string;

  @IsOptional()
  @IsNumber()
  birthWeight?: number;

  @IsOptional()
  @IsNumber()
  ageToWean?: number;

  @IsOptional()
  @IsDateString()
  dateWeaned?: string;

  @IsOptional()
  @IsString()
  raisedOrPurchased?: string;

  @IsOptional()
  @IsString()
  veterinarian?: string;

  @IsOptional()
  @IsBoolean()
  onFeed?: boolean;

  @IsOptional()
  @IsString()
  feedType?: string;

  @IsOptional()
  @IsString()
  measureHarvestsIn?: string;

  @IsOptional()
  @IsNumber()
  estimatedRevenue?: number;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsString()
  fieldId?: string;
}
