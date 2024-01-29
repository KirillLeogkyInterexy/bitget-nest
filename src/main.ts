import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module.js';
import { TradingService } from './modules/trading/trading.service.js';
import { CustomLoggerService } from './modules/logger/logger.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(),
  });
  const configService = app.get(ConfigService);

  app.get(TradingService);

  await app.listen(configService.get('APP_PORT'));
}

bootstrap();
