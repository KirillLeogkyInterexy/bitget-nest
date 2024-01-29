import { Injectable } from '@nestjs/common';
import { WebsocketClientV2, DefaultLogger } from 'bitget-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebsocketService {
  private wsClient: WebsocketClientV2;
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('API_KEY');
    const apiSecret = this.configService.get<string>('API_SECRET');
    const apiPass = this.configService.get<string>('API_PASS');

    this.wsClient = new WebsocketClientV2(
      {
        apiKey,
        apiSecret,
        apiPass,
      },
      {
        ...DefaultLogger,
        silly: () => {},
        info: () => {},
      },
    );
  }

  getWebSocketClient(): WebsocketClientV2 {
    return this.wsClient;
  }
}
