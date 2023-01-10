import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as bodyParser from 'body-parser';
import { ConfigApiService, LoggingInterceptor, MetricsService } from '..';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class MicroserviceConfigurator {
  private nestApplication: INestApplication | undefined;

  async create(module: any): Promise<void> {
    this.nestApplication = await NestFactory.create(module);
  }

  setup(): void {
    if (!this.nestApplication) {
      return;
    }

    this.nestApplication.use(bodyParser.json({ limit: '1mb' }));
    this.nestApplication.enableCors();
    this.nestApplication.useLogger(
      this.nestApplication.get(WINSTON_MODULE_NEST_PROVIDER),
    );
    this.useLoggingInterceptor();
    this.useSwagger();
  }

  listen(port: number): void {
    if (!this.nestApplication) {
      return;
    }

    this.nestApplication.listen(port);
  }

  private useLoggingInterceptor(): void {
    if (!this.nestApplication) {
      return;
    }

    const metricsService =
      this.nestApplication.get<MetricsService>(MetricsService);

    this.nestApplication.useGlobalInterceptors(
      new LoggingInterceptor(metricsService),
    );
  }

  private useSwagger(): void {
    if (!this.nestApplication) {
      return;
    }

    const configApiService =
      this.nestApplication.get<ConfigApiService>(ConfigApiService);

    if (configApiService.getEnv() === 'mainnet') {
      return;
    }

    const description = readFileSync(
      join(__dirname, '/../../../../', 'docs', 'swagger.md'),
      'utf8',
    );

    let documentBuilder = new DocumentBuilder()
      .setTitle('MultiversX Microservice API')
      .setDescription(description)
      .setVersion('1.0.0')
      .setExternalDoc('MultiversX Docs', 'https://docs.multiversx.com');

    const apiUrls = configApiService.getSwaggerUrls();
    for (const apiUrl of apiUrls) {
      documentBuilder = documentBuilder.addServer(apiUrl);
    }

    const config = documentBuilder.build();

    const document = SwaggerModule.createDocument(this.nestApplication, config);
    SwaggerModule.setup('docs', this.nestApplication, document);
  }
}
