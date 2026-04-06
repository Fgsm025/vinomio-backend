import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateSupplyStockMovementDto {
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsIn(['INCOMING', 'OUTGOING'])
  type!: 'INCOMING' | 'OUTGOING';

  /** ISO date (yyyy-mm-dd); defaults to today on the server if omitted */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  date?: string;

  @IsOptional()
  @IsUUID()
  cropCycleId?: string | null;
}
