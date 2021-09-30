import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import { ConfigApiService } from './config-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [ConfigApiService],
  exports: [ConfigApiService],
})
export class ConfigApiModule {}
