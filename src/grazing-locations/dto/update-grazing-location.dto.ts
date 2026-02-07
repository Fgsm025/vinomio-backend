import { PartialType } from '@nestjs/mapped-types';
import { CreateGrazingLocationDto } from './create-grazing-location.dto';

export class UpdateGrazingLocationDto extends PartialType(CreateGrazingLocationDto) {}
