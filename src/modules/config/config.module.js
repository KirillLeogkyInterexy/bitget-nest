var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService, } from '@nestjs/config';
import { validationSchema } from './config.validation';
let ConfigModule = class ConfigModule {
};
ConfigModule = __decorate([
    Module({
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
], ConfigModule);
export { ConfigModule };
//# sourceMappingURL=config.module.js.map