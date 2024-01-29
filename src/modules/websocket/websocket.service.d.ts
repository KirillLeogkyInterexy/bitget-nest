import { WebsocketClientV2 } from 'bitget-api';
import { ConfigService } from '@nestjs/config';
export declare class WebsocketService {
    private configService;
    private wsClient;
    constructor(configService: ConfigService);
    getWebSocketClient(): WebsocketClientV2;
}
