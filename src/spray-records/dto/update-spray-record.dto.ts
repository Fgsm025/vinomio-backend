import { PartialType } from '@nestjs/mapped-types';
import { CreateSprayRecordDto } from './create-spray-record.dto';

export class UpdateSprayRecordDto extends PartialType(CreateSprayRecordDto) {}
