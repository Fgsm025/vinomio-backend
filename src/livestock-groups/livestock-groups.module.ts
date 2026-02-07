import { Module } from '@nestjs/common';
import { LivestockGroupsController } from './livestock-groups.controller';
import { LivestockGroupsService } from './livestock-groups.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LivestockGroupsController],
  providers: [LivestockGroupsService],
})
export class LivestockGroupsModule {}
