import { IsUUID } from 'class-validator';

export class GenerateGreenCardDto {
  @IsUUID()
  cropCycleId!: string;
}
