var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TradingService_1;
var _a, _b;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebsocketService } from '../websocket/websocket.service';
import { BitgetService } from '../bitget/bitget.service';
import { OrderSide, OrderStatus, WebSocketSubscriptionChannel, } from '../../types';
import chalk from 'chalk';
const message = chalk.bold.underline.hex('#AE6EFF')('Take Profit достигнут!');
const addPercentageToNumber = (number, percentage) => {
    const increase = number * (percentage / 100);
    return Number(roundToTwoDecimalPlaces(number + increase));
};
const roundToFourDecimalPlaces = (number) => Number(`${number}`.match(/^(\d+\.\d{0,4})\d*$/)[1]);
const roundToTwoDecimalPlaces = (number) => Math.floor(number * 100) / 100;
let TradingService = TradingService_1 = class TradingService {
    constructor(configService, bitgetService, websocketService) {
        this.configService = configService;
        this.bitgetService = bitgetService;
        this.websocketService = websocketService;
        this.logger = new Logger(TradingService_1.name);
        this.takeProfitOrderId = '';
        this.insuranceOrderTakeProfitAmount = 0;
        this.initialCryptoPricePerOne = 0;
        this.insuranceOrderIdList = [];
        this.totalPurchasedCryptoAmount = 0;
        this.buyAmount = this.configService.get('BUY_AMOUNT');
        this.takeProfitPercentage = this.configService.get('TAKE_PROFIT_PERCENTAGE');
        this.symbol = this.configService.get('SYMBOL');
        this.priceDropPercentage = this.configService.get('PRICE_DROP_PERCENTAGE');
        this.insuranceOrdersAmount = this.configService.get('INSURANCE_ORDERS_AMOUNT');
        this.insuranceOrdersIntervalMultiplier = this.configService.get('INSURANCE_ORDERS_INTERVAL_MULTIPLIER');
        this.insuranceOrdersMultiplier = this.configService.get('INSURANCE_ORDERS_MULTIPLIER');
        this.monitorMarket();
    }
    async monitorMarket() {
        this.logger.log(message);
    }
    async initializeCryptoBot() {
        try {
            const marketOrder = {
                side: OrderSide.BUY,
                orderType: 'market',
                force: 'gtc',
                size: `${this.buyAmount}`,
            };
            const { data } = (await this.placeOrder(marketOrder)) || {};
            console.log('Market order executed:', data);
            const { orderId } = data || {};
            const { data: executedOrderInfo } = await this.bitgetService.getOrderInfo({
                orderId: orderId,
            });
            console.log('Info about executed market order:', executedOrderInfo);
            const executedOrderPricePerOneSymbol = Number(executedOrderInfo[0]?.priceAvg);
            const executedOrderCryptoPurchasedAmount = roundToFourDecimalPlaces(Number(executedOrderInfo[0]?.baseVolume));
            this.totalPurchasedCryptoAmount =
                this.totalPurchasedCryptoAmount + executedOrderCryptoPurchasedAmount;
            this.takeProfitOrderId = await this.placeTakeProfitOrder(addPercentageToNumber(executedOrderPricePerOneSymbol, this.takeProfitPercentage));
            this.initialCryptoPricePerOne = roundToTwoDecimalPlaces(executedOrderPricePerOneSymbol);
            console.log('this.totalPurchasedCryptoAmount', this.totalPurchasedCryptoAmount);
            console.log('this.takeProfitOrderId', this.takeProfitOrderId);
            console.log('this.initialCryptoPricePerOne', this.initialCryptoPricePerOne);
            await this.placeInsuranceOrders();
        }
        catch (error) {
            this.logger.error('Error in initializing crypto bot:', error);
        }
    }
    async placeInsuranceOrders() {
        let currentInsuranceOrdersMultiplier = this.insuranceOrdersMultiplier;
        let calculatedInsuranceDropPercentage = this.priceDropPercentage;
        for (let i = 0; i < this.insuranceOrdersAmount; i++) {
            const priceDrop = (this.initialCryptoPricePerOne * calculatedInsuranceDropPercentage) /
                100;
            const nextOrderPrice = roundToTwoDecimalPlaces(this.initialCryptoPricePerOne - priceDrop);
            const nextOrderSize = (this.buyAmount / nextOrderPrice) * currentInsuranceOrdersMultiplier;
            if (nextOrderSize <= 0 || nextOrderPrice <= 0) {
                break;
            }
            const safetyOrder = {
                side: OrderSide.BUY,
                orderType: 'limit',
                force: 'gtc',
                size: `${roundToFourDecimalPlaces(nextOrderSize)}`,
                price: `${nextOrderPrice}`,
            };
            const { data } = (await this.placeOrder(safetyOrder)) || {};
            console.log('Limit order executed:', data);
            this.insuranceOrderIdList.push(data?.orderId);
            currentInsuranceOrdersMultiplier =
                currentInsuranceOrdersMultiplier * this.insuranceOrdersMultiplier;
            calculatedInsuranceDropPercentage =
                calculatedInsuranceDropPercentage *
                    this.insuranceOrdersIntervalMultiplier +
                    this.priceDropPercentage;
        }
        console.log('this.insuranceOrderIdList', this.insuranceOrderIdList);
        this.subscribeToOrderUpdates();
    }
    async placeOrder(order) {
        try {
            const data = await this.bitgetService.submitOrder(order);
            return data;
        }
        catch (error) {
            this.logger.error('Error when placing order:', error);
        }
    }
    async cancelOrder(orderId) {
        try {
            const data = await this.bitgetService.cancelOrder({ orderId: orderId });
            return data;
        }
        catch (error) {
            this.logger.error('Error when canceling order:', error);
        }
    }
    async restartCryptoBot() {
        this.takeProfitOrderId = '';
        this.insuranceOrderTakeProfitAmount = 0;
        this.initialCryptoPricePerOne = 0;
        this.totalPurchasedCryptoAmount = 0;
        const cancelInsuranceOrderPromises = this.insuranceOrderIdList.map((orderId) => this.cancelOrder(orderId));
        await Promise.all(cancelInsuranceOrderPromises);
    }
    async placeTakeProfitOrder(orderPrice) {
        const takeProfitOrder = {
            side: OrderSide.SELL,
            orderType: 'limit',
            force: 'gtc',
            size: `${roundToFourDecimalPlaces(this.totalPurchasedCryptoAmount)}`,
            price: `${orderPrice}`,
        };
        const { data } = (await this.placeOrder(takeProfitOrder)) || {};
        console.log('Take Profit order executed:', data);
        return data?.orderId;
    }
    async handleOrderChanged(orderChangedInfo) {
        if (orderChangedInfo.status === OrderStatus.FILLED) {
            const { priceAvg, accBaseVolume } = orderChangedInfo;
            const isTakeProfitOrderFilled = this.takeProfitOrderId === orderChangedInfo.orderId;
            if (isTakeProfitOrderFilled) {
                this.logger.log('Take Profit достугнут!');
                this.logger.log(`Продано по цене: ${priceAvg}`);
                this.logger.log(`Всего криптовалюты продано: ${accBaseVolume}`);
                this.restartCryptoBot();
            }
            else {
                const insuranceOrderIdIndex = this.insuranceOrderIdList.findIndex((orderId) => orderId === orderChangedInfo.orderId);
                if (insuranceOrderIdIndex !== -1) {
                    const insuranceOrderTakeProfit = addPercentageToNumber((Number(priceAvg) + this.initialCryptoPricePerOne) / 2, this.takeProfitPercentage);
                    console.log('insuranceOrderTakeProfit', insuranceOrderTakeProfit);
                    this.totalPurchasedCryptoAmount += roundToFourDecimalPlaces(Number(accBaseVolume));
                    this.insuranceOrderIdList.splice(insuranceOrderIdIndex, 1);
                    console.log('this.totalPurchasedCryptoAmount', this.totalPurchasedCryptoAmount);
                    console.log('this.takeProfitOrderId', this.takeProfitOrderId);
                    this.insuranceOrderTakeProfitAmount = insuranceOrderTakeProfit;
                    this.cancelOrder(this.takeProfitOrderId);
                }
            }
        }
        if (orderChangedInfo.status === OrderStatus.CANCELLED) {
            if (orderChangedInfo.orderId === this.takeProfitOrderId) {
                this.takeProfitOrderId = await this.placeTakeProfitOrder(this.insuranceOrderTakeProfitAmount);
                this.insuranceOrderTakeProfitAmount = 0;
            }
            else {
                const insuranceOrderIdIndex = this.insuranceOrderIdList.findIndex((orderId) => orderId === orderChangedInfo.orderId);
                if (insuranceOrderIdIndex !== -1) {
                    this.insuranceOrderIdList.splice(insuranceOrderIdIndex, 1);
                    this.logger.log('this.insuranceOrderIdList', this.insuranceOrderIdList);
                    if (!this.insuranceOrderIdList.length) {
                    }
                }
            }
        }
    }
    subscribeToOrderUpdates() {
        const wsClient = this.websocketService.getWebSocketClient();
        wsClient.subscribeTopic('SPOT', 'orders', this.symbol);
        wsClient.on('update', async ({ data, arg }) => {
            if (arg.channel === WebSocketSubscriptionChannel.ORDERS) {
                const [orderData] = data;
                this.handleOrderChanged(orderData);
            }
        });
        wsClient.on('authenticated', async (data) => {
            console.log('WS authenticated', data);
        });
    }
};
TradingService = TradingService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService, typeof (_a = typeof BitgetService !== "undefined" && BitgetService) === "function" ? _a : Object, typeof (_b = typeof WebsocketService !== "undefined" && WebsocketService) === "function" ? _b : Object])
], TradingService);
export { TradingService };
//# sourceMappingURL=trading.service.js.map