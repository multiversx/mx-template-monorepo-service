import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics';
import { ConfigApiModule } from '../config-api';
import { MultiversXApiService } from './multiversx-api.service';

@Module({
  imports: [ConfigApiModule, MetricsModule],
  providers: [MultiversXApiService],
  exports: [MultiversXApiService],
})
export class MultiversXApiModule {}
