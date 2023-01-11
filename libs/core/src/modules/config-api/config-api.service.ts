import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigApiService {
  constructor(private readonly configService: ConfigService) {}

  getEnv(): string {
    const env = this.configService.get<string>('env');
    if (!env) {
      throw new Error('Env is not defined.');
    }
    return env;
  }

  getMultiversXApiUrl(): string {
    const apiUrl = this.configService.get<string>('urls.mxApi');
    if (!apiUrl) {
      throw new Error('No API url present');
    }

    return apiUrl;
  }

  getSwaggerUrls(): string[] {
    const swaggerUrls = this.configService.get<string[]>('urls.swagger');
    if (!swaggerUrls) {
      throw new Error('No swagger urls present');
    }

    return swaggerUrls;
  }

  getRedisUrl(): string {
    const redisUrl = this.configService.get<string>('urls.redis');
    if (!redisUrl) {
      throw new Error('No redisUrl present');
    }

    return redisUrl;
  }

  getJwtSecret(): string {
    const jwtSecret = this.configService.get<string>('security.jwtSecret');
    if (!jwtSecret) {
      throw new Error('No jwtSecret present');
    }

    return jwtSecret;
  }

  getRabbitMqUrl(): string {
    const rabbitMqUrl = this.configService.get<string>('urls.rabbitMqUrl');
    if (!rabbitMqUrl) {
      throw new Error('No RabbitMqUrl present.');
    }

    return rabbitMqUrl;
  }
}
