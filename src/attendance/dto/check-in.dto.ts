import { IsString, IsIn, IsOptional, IsNumber } from 'class-validator';

export class CheckInDto {
  @IsString()
  code: string;

  @IsIn(['check_in', 'check_out'])
  type: 'check_in' | 'check_out';

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
