import { PartialType } from '@nestjs/mapped-types';
import { CreateTraceabilityRecordDto } from './create-traceability-record.dto';

export class UpdateTraceabilityRecordDto extends PartialType(CreateTraceabilityRecordDto) {}
