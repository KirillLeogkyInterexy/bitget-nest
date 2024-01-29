var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RestClientV2 } from 'bitget-api';
let BitgetService = class BitgetService {
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('API_KEY');
        const apiSecret = this.configService.get('API_SECRET');
        const apiPass = this.configService.get('API_PASS');
        this.client = new RestClientV2({
            apiKey,
            apiSecret,
            apiPass,
        });
    }
    async getSpotTicker() {
        try {
            const { data } = await this.client.getSpotTicker({
                symbol: this.configService.get('SYMBOL'),
            });
            return data;
        }
        catch (err) {
            throw new BadRequestException({
                message: err.body.msg,
                code: err.code,
            });
        }
    }
    async getSpotHistoricOrders() {
        try {
            const { data } = await this.client.getSpotHistoricOrders({
                symbol: this.configService.get('SYMBOL'),
            });
            return data;
        }
        catch (err) {
            throw new BadRequestException({
                message: err.body.msg,
                code: err.code,
            });
        }
    }
    async cancelOrder(cancelOrderDto) {
        try {
            const { data } = await this.client.spotCancelOrder({
                ...cancelOrderDto,
                symbol: this.configService.get('SYMBOL'),
            });
            return data;
        }
        catch (err) {
            throw new BadRequestException({
                message: err.body.msg,
                code: err.code,
            });
        }
    }
    async getOrderInfo(orderInfoDto) {
        try {
            console.log('orderInfoDto', orderInfoDto);
            const data = await this.client.getSpotOrder({
                ...orderInfoDto,
            });
            return data;
        }
        catch (err) {
            throw new BadRequestException({
                message: `Error getting order info: ${err.body.msg}`,
                code: err.code,
            });
        }
    }
    async submitOrder(orderDto) {
        try {
            console.log('orderDto', {
                ...orderDto,
                symbol: this.configService.get('SYMBOL'),
            });
            const data = await this.client.spotSubmitOrder({
                ...orderDto,
                symbol: this.configService.get('SYMBOL'),
            });
            return data;
        }
        catch (err) {
            throw new BadRequestException({
                message: err.body.msg,
                code: err.code,
            });
        }
    }
};
BitgetService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], BitgetService);
export { BitgetService };
//# sourceMappingURL=bitget.service.js.map