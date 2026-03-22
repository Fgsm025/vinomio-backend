import { Module } from '@nestjs/common';
import { ScoutingRecordsController } from './scouting-records.controller';
import { ScoutingRecordsService } from './scouting-records.service';

@Module({
  controllers: [ScoutingRecordsController],
  providers: [ScoutingRecordsService],
  exports: [ScoutingRecordsService],
})
export class ScoutingRecordsModule {}
