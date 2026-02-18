import { PartialType } from '@nestjs/mapped-types';
import { CreateLotDto } from './lots.dto';

export class UpdateLotDto extends PartialType(CreateLotDto) {}
