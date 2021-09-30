import { Module } from '@nestjs/common';
import { CachingModule, MetricsModule, RabbitMqModule } from '@template/core';
import { RabbitMqExampleConsumer } from './example.consumer';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';

@Module({
  imports: [
    CachingModule,
    MetricsModule,
    RabbitMqModule.register({
      exchanges: ['test_exchange'],
    }),
  ],
  controllers: [ExampleController],
  providers: [ExampleService, RabbitMqExampleConsumer],
  exports: [ExampleService],
})
export class ExampleModule {}
