import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const PROFESSIONAL_ROLES = [
  'veterinarian',
  'agronomist',
  'consultant',
  'technician',
  'laboratory',
  'other',
] as const;

const RATE_TYPES = ['hourly', 'service', 'per_ha'] as const;

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn([...PROFESSIONAL_ROLES])
  role: (typeof PROFESSIONAL_ROLES)[number];

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn([...RATE_TYPES])
  rateType?: (typeof RATE_TYPES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateAmount?: number;
}
