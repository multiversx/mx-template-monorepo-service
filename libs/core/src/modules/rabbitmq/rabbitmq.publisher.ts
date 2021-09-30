import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMqPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  /** Will publish the event to the exchange. */
  async publish<T>(exchange: string, event: T): Promise<void> {
    await this.amqpConnection.publish(exchange, '', event);
  }
}
