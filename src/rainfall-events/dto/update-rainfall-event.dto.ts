import { PartialType } from '@nestjs/mapped-types';
import { CreateRainfallEventDto } from './create-rainfall-event.dto';

export class UpdateRainfallEventDto extends PartialType(CreateRainfallEventDto) {}
