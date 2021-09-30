import { Module } from '@nestjs/common';
import { ConfigApiModule, logTransports, MetricsModule } from '@template/core';
import { WinstonModule } from 'nest-winston';
import { ExampleModule } from './endpoints/example/example.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'verbose',
      transports: logTransports,
    }),
    MetricsModule,
    ConfigApiModule,
    ExampleModule,
  ],
})
export class AppModule {}
