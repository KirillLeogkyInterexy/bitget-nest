import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RestClientV2 } from 'bitget-api';
import {
  CancelOrderDto,
  CancelOrderResponseDto,
  OrderInfoDto,
  OrderInfoResponseDto,
  SpotOrderDto,
  SpotTickerResponseDto,
  SubmitOrderResponseDto,
  USDTAccountBalanceResponseDto,
} from '../../types/index.js';

@Injectable()
export class BitgetService {
  private client: RestClientV2;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('API_KEY');
    const apiSecret = this.configService.get<string>('API_SECRET');
    const apiPass = this.configService.get<string>('API_PASS');

    this.client = new RestClientV2({
      apiKey,
      apiSecret,
      apiPass,
    });
  }

  async getSpotTicker(): Promise<SpotTickerResponseDto> {
    try {
      const { data } = await this.client.getSpotTicker({
        symbol: this.configService.get<string>('SYMBOL'),
      });

      return data[0];
    } catch (err) {
      throw new BadRequestException({
        message: err.body.msg,
        code: err.code,
      });
    }
  }

  async getUSDTAccountBalance(): Promise<USDTAccountBalanceResponseDto> {
    try {
      const { data } = await this.client.getSpotAccountAssets({
        coin: 'USDT',
      });

      return data[0];
    } catch (err) {
      throw new BadRequestException({
        message: err.body.msg,
        code: err.code,
      });
    }
  }

  async cancelOrder(
    cancelOrderDto: CancelOrderDto,
  ): Promise<CancelOrderResponseDto> {
    try {
      const { data } = await this.client.spotCancelOrder({
        ...cancelOrderDto,
        symbol: this.configService.get<string>('SYMBOL'),
      });

      return data;
    } catch (err) {
      throw new BadRequestException({
        message: err.body.msg,
        code: err.code,
      });
    }
  }

  async getOrderInfo(
    orderInfoDto: OrderInfoDto,
  ): Promise<OrderInfoResponseDto> {
    try {
      const data = await this.client.getSpotOrder({
        ...orderInfoDto,
      });

      return data;
    } catch (err) {
      throw new BadRequestException({
        message: `Error getting order info: ${err.body.msg}`,
        code: err.code,
      });
    }
  }

  async submitOrder(orderDto: SpotOrderDto): Promise<SubmitOrderResponseDto> {
    try {
      const data = await this.client.spotSubmitOrder({
        ...orderDto,
        symbol: this.configService.get<string>('SYMBOL'),
      });

      return data;
    } catch (err) {
      throw new BadRequestException({
        message: err.body.msg,
        code: err.code,
      });
    }
  }
}
