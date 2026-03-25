import { IsEmail, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  userName?: string;

  /** ISO date string YYYY-MM-DD or empty to clear */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneNumber?: string;

  @IsOptional()
  @ValidateIf((o) => o.secondaryEmail != null && String(o.secondaryEmail).trim() !== '')
  @IsEmail()
  @MaxLength(255)
  secondaryEmail?: string;
}
