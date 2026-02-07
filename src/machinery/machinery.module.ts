import { Module } from '@nestjs/common';
import { MachineryController } from './machinery.controller';
import { MachineryService } from './machinery.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MachineryController],
  providers: [MachineryService],
})
export class MachineryModule {}
