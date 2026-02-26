import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CheckInByCodeDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
