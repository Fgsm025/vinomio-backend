import { Module } from '@nestjs/common';
import { LemonSqueezyController } from './lemonsqueezy.controller';
import { LemonSqueezyService } from './lemonsqueezy.service';

@Module({
  imports: [],
  controllers: [LemonSqueezyController],
  providers: [LemonSqueezyService],
})
export class LemonSqueezyModule {}
