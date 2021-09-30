import { Injectable } from '@nestjs/common';
import { CompetingRabbitMqConsumer } from '@template/core';

@Injectable()
export class RabbitMqExampleConsumer {
  @CompetingRabbitMqConsumer({
    exchange: 'test_exchange',
    queue: 'test_queue',
  })
  async test(event: any): Promise<void> {
    console.log('Event arrived', event);
  }
}
