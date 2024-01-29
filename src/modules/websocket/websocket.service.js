var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { WebsocketClientV2 } from 'bitget-api';
import { ConfigService } from '@nestjs/config';
let WebsocketService = class WebsocketService {
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('API_KEY');
        const apiSecret = this.configService.get('API_SECRET');
        const apiPass = this.configService.get('API_PASS');
        this.wsClient = new WebsocketClientV2({
            apiKey,
            apiSecret,
            apiPass,
        });
    }
    getWebSocketClient() {
        return this.wsClient;
    }
};
WebsocketService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], WebsocketService);
export { WebsocketService };
//# sourceMappingURL=websocket.service.js.map