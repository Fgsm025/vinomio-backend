import { PartialType } from '@nestjs/mapped-types';
import { CreateLivestockGroupDto } from './create-livestock-group.dto';

export class UpdateLivestockGroupDto extends PartialType(CreateLivestockGroupDto) {}
