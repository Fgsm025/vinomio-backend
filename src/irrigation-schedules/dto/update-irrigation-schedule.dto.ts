import { PartialType } from '@nestjs/mapped-types';
import { CreateIrrigationScheduleDto } from './create-irrigation-schedule.dto';

export class UpdateIrrigationScheduleDto extends PartialType(CreateIrrigationScheduleDto) {}
