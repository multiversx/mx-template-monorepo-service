import { Module } from '@nestjs/common';
import { ConfigApiModule, logTransports, MetricsModule } from '@template/core';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'verbose',
      transports: logTransports,
    }),
    MetricsModule,
    ConfigApiModule,
  ],
  controllers: [],
  providers: [],
})
export class MicroserviceModule {}
