import { ConfigService } from '@nestjs/config';
import { CancelOrderDto, CancelOrderResponseDto, OrderInfoDto, OrderInfoResponseDto, SpotOrderDto, SubmitOrderResponseDto } from '../../types';
export declare class BitgetService {
    private configService;
    private client;
    constructor(configService: ConfigService);
    getSpotTicker(): Promise<any>;
    getSpotHistoricOrders(): Promise<any>;
    cancelOrder(cancelOrderDto: CancelOrderDto): Promise<CancelOrderResponseDto>;
    getOrderInfo(orderInfoDto: OrderInfoDto): Promise<OrderInfoResponseDto>;
    submitOrder(orderDto: SpotOrderDto): Promise<SubmitOrderResponseDto>;
}
