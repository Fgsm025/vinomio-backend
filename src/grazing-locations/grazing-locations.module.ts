import { Module } from '@nestjs/common';
import { GrazingLocationsController } from './grazing-locations.controller';
import { GrazingLocationsService } from './grazing-locations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GrazingLocationsController],
  providers: [GrazingLocationsService],
})
export class GrazingLocationsModule {}
