export interface RabbitMqConsumerConfig {
  exchange: string;
  queue: string;
}

export interface RabbitMqModuleConfig {
  exchanges: string[];
}
