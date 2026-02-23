import { PartialType } from '@nestjs/mapped-types';
import { CreateWaterConsumptionDto } from './create-water-consumption.dto';

export class UpdateWaterConsumptionDto extends PartialType(CreateWaterConsumptionDto) {}
