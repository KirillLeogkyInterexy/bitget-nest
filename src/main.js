import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { TradingService } from './modules/trading/trading.service';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    app.get(TradingService);
    await app.listen(configService.get('APP_PORT'));
}
bootstrap();
//# sourceMappingURL=main.js.map