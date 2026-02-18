import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldDto } from './create-fields.dto';

export class UpdateFieldDto extends PartialType(CreateFieldDto) {}
