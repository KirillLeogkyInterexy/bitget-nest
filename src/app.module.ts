import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ConfigModule, BitgetModule } from './modules/index.js';

@Module({
  imports: [ConfigModule, BitgetModule],
  providers: [AppService],
})
export class AppModule {}
