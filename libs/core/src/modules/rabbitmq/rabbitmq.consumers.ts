import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { applyDecorators } from '@nestjs/common';
import { RabbitMqConsumerConfig } from './rabbitmq.configs';
import uuid from 'uuid';

/** Competing Consumer which will be handled by only one instance of the microservice.
 * Make sure the exchange exists.
 */
export const CompetingRabbitMqConsumer = (config: RabbitMqConsumerConfig) => {
  const { queue, exchange } = config;

  return applyDecorators(
    RabbitSubscribe({
      queue: `${queue}`,
      exchange,
      routingKey: '',
    }),
  );
};

/** Public Consumer which will be handled by all instances of the microservice.
 * Make sure the exchange exists.
 */
export const PublicRabbitMqConsumer = (config: RabbitMqConsumerConfig) => {
  const { queue, exchange } = config;

  return applyDecorators(
    RabbitSubscribe({
      queue: `${queue}_${uuid.v4()}`,
      exchange,
      routingKey: '',
      queueOptions: {
        autoDelete: true,
      },
    }),
  );
};
