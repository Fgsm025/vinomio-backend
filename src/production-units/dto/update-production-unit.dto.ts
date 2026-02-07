import { PartialType } from '@nestjs/mapped-types';
import { CreateProductionUnitDto } from './create-production-unit.dto';

export class UpdateProductionUnitDto extends PartialType(
  CreateProductionUnitDto,
) {}
