import { PartialType } from '@nestjs/mapped-types';
import { CreateCropCycleDto } from './create-crop-cycle.dto';

export class UpdateCropCycleDto extends PartialType(CreateCropCycleDto) {}
