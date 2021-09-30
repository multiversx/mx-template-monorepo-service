import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics';
import { ConfigApiModule } from '../config-api';
import { ElrondApiService } from './elrond-api.service';

@Module({
  imports: [ConfigApiModule, MetricsModule],
  providers: [ElrondApiService],
  exports: [ElrondApiService],
})
export class ElrondApiModule {}
