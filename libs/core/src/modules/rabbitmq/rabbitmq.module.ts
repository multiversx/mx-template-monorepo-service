import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigApiModule, ConfigApiService } from '@template/core';
import { RabbitMqModuleConfig } from './rabbitmq.configs';
import { RabbitMqPublisher } from './rabbitmq.publisher';

@Module({})
export class RabbitMqModule {
  static register(config: RabbitMqModuleConfig): DynamicModule {
    const { exchanges } = config;
    return {
      module: RabbitMqModule,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configApiService: ConfigApiService) => {
            return {
              exchanges: exchanges.map((exchange) => {
                return {
                  name: exchange,
                  type: 'fanout',
                  options: {},
                };
              }),
              uri: configApiService.getRabbitMqUrl(),
            };
          },
          inject: [ConfigApiService],
          imports: [ConfigApiModule],
        }),
      ],
      providers: [RabbitMqPublisher],
      exports: [RabbitMqPublisher],
    };
  }
}
