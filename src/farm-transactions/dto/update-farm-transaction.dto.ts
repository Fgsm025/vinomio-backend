import { PartialType } from '@nestjs/mapped-types';
import { CreateFarmTransactionDto } from './create-farm-transaction.dto';

export class UpdateFarmTransactionDto extends PartialType(CreateFarmTransactionDto) {}
