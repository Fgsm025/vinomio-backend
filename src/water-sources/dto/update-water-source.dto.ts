import { PartialType } from '@nestjs/mapped-types';
import { CreateWaterSourceDto } from './create-water-source.dto';

export class UpdateWaterSourceDto extends PartialType(CreateWaterSourceDto) {}
