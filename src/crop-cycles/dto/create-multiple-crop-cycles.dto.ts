import { IsArray, IsString } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { CreateCropCycleDto } from './create-crop-cycle.dto';

export class CreateMultipleCropCyclesDto extends OmitType(CreateCropCycleDto, ['plotId'] as const) {
  @IsArray()
  @IsString({ each: true })
  plotIds: string[];
}
