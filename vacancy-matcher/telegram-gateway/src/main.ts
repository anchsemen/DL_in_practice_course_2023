import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

var bodyParser = require('body-parser');

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.setGlobalPrefix("api");

  await app.listen(process.env.BOT_PORT);
}

bootstrap();
