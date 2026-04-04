import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

function emptyToUndefined({ value }: { value: unknown }) {
  return value === '' || value === null ? undefined : value;
}

export class CreateRainfallEventDto {
  /** Ignorado en create: se asigna desde el token (whitelist para no fallar forbidNonWhitelisted). */
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  farmId?: string;

  /** Opcional: si se omite, la lluvia aplica a toda la finca (se asigna farmId en servidor). */
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  fieldId?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  plotId?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  cropCycleId?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  amountMm?: number;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  intensity?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  source?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  notes?: string;
}
