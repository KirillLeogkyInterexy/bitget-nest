import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';

import { validationSchema } from './config.validation.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: '.env',
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
