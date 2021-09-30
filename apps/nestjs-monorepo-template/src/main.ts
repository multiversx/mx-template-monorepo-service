import { MicroserviceConfigurator } from '@template/core';
import { someConst } from '@template/example';
import { AppModule } from './app.module';

console.log(someConst);

async function bootstrap() {
  const microserviceConfigurator = new MicroserviceConfigurator();
  await microserviceConfigurator.create(AppModule);
  microserviceConfigurator.setup();
  microserviceConfigurator.listen(3000);
}

bootstrap();
