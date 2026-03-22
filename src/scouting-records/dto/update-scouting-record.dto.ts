import { PartialType } from '@nestjs/mapped-types';
import { CreateScoutingRecordDto } from './create-scouting-record.dto';

export class UpdateScoutingRecordDto extends PartialType(CreateScoutingRecordDto) {}
