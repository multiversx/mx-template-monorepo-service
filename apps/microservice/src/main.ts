import { MicroserviceConfigurator } from '@template/core';
import { someConst } from '@template/example';
import { MicroserviceModule } from './microservice.module';

console.log(someConst);

async function bootstrap() {
  const microserviceConfigurator = new MicroserviceConfigurator();
  await microserviceConfigurator.create(MicroserviceModule);
  microserviceConfigurator.setup();
  microserviceConfigurator.listen(3001);
}

bootstrap();
