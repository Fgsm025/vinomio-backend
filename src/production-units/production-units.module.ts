import { Module } from '@nestjs/common';
import { ProductionUnitsController } from './production-units.controller';
import { ProductionUnitsService } from './production-units.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProductionUnitsController],
  providers: [ProductionUnitsService],
})
export class ProductionUnitsModule {}
